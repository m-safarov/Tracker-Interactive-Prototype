"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { Globe, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "radix-ui";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getAuthError,
  postLogout,
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/features/auth/auth-api";
import { AuthProvider, FormField } from "@/features/auth/auth-screen";
import {
  changePasswordSchema,
  profileFormSchema,
  type AccountProfile,
  type ChangePasswordBody,
  type UpdateProfileBody,
} from "@/features/auth/schema";
import { errorText } from "@/lib/api";

import translations from "./page-translations.json";

type Language = keyof typeof translations;
type Theme = "light" | "dark" | "system";
type ProfileText = typeof translations.en;
type RequestError = keyof ProfileText["errors"];

const loginUrl = "/login?next=%2Fprofile";
const themeKey = "tracker-profile-theme";
const languageKey = "tracker-profile-language";
const preferenceEvent = "tracker-profile-preferences-changed";
const systemTheme = "(prefers-color-scheme: dark)";
const colors = "[--primary:#3b5bdb] [--primary-foreground:#fff] [--radius:6px] [--ring:#3b5bdb]";
const selectStyle = "h-8 w-full appearance-none rounded-md border border-input bg-background text-center text-sm outline-none focus-visible:border-ring";

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfileContent />
    </AuthProvider>
  );
}

function ProfileContent() {
  const { data: profile, error, isLoading, refetch } = useGetProfileQuery();
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      queryClient.clear();
      router.replace("/sign-in");
    },
  });
  const { language, theme, isDark } = useProfilePreferences();
  const text = translations[language];
  const needsLogin = error && "status" in error && error.status === 401;

  return (
    <div
      lang={language}
      translate="no"
      className={cn("min-h-dvh text-foreground", colors, isDark ? "dark bg-background" : "bg-white")}
    >
      <header className="border-b">
        <div className="mx-auto flex min-h-12 max-w-[960px] items-center justify-between gap-4 px-4 sm:px-6">
          <p className="text-sm">
            <span className="text-muted-foreground">Tracker /</span> {text.profile}
          </p>
          {profile && (
            <div className="flex min-w-0 items-center gap-2">
              <ProfileAvatar profile={profile} />
              <span data-slot="profile-display-name" className="truncate text-sm font-medium">
                {profile.display_name}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-4 py-5 sm:px-6">
        <h1 className="mb-10 text-base font-semibold">{text.profile}</h1>
        {isLoading && <p role="status" className="text-sm text-muted-foreground">{text.loading}</p>}
        {profile && (
          <div className="grid max-w-[592px] gap-5">
            <ProfileForm key={profile.id} profile={profile} text={text} />
            <Preferences theme={theme} isDark={isDark} language={language} text={text} />
            <Button type="button" variant="outline" className="justify-self-start"
              disabled={logout.isPending || logout.isSuccess} onClick={() => logout.mutate()}>{text.logOut}</Button>
            {logout.error && <p role="alert" className="text-sm text-destructive">{errorText(logout.error)}</p>}
          </div>
        )}
        {!profile && error && (
          <div className="grid justify-items-start gap-3">
            <p role="alert" className="text-sm text-destructive">{text.errors[requestError(error)]}</p>
            {needsLogin
              ? <Button asChild><Link href={loginUrl}>{text.signIn}</Link></Button>
              : <Button variant="outline" onClick={refetch}>{text.retry}</Button>}
          </div>
        )}
      </main>
    </div>
  );
}

function ProfileForm({ profile, text }: { profile: AccountProfile; text: ProfileText }) {
  const [updateProfile, { error: saveError, isSuccess }] = useUpdateProfileMutation();
  const { register, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileValues(profile),
  });

  const { errors, isSubmitting, isDirty } = formState;
  const nameError = errors.display_name && (
    errors.display_name.type === "too_big" ? text.nameTooLong : text.nameRequired
  );

  async function saveProfile(values: UpdateProfileBody) {
    const { data } = await updateProfile(values);
    if (data) reset(profileValues(data));
  }

  return (
    <SettingsCard title={text.profile}>
      <ProfileAvatar profile={profile} />
      <form onSubmit={handleSubmit(saveProfile)} method="post" noValidate className="mt-4 grid gap-4">
        <FormField
          {...register("display_name")}
          id="profile-name"
          label={text.name}
          autoComplete="name"
          error={nameError}
          required
        />
        <FormField
          {...register("avatar_url")}
          id="profile-photo"
          label={text.photoUrl}
          type="url"
          error={errors.avatar_url && text.invalidPhoto}
        />
        <FormField id="profile-email" label={text.email} type="email" value={profile.email} readOnly />

        {saveError && (
          <p role="alert" className="text-sm text-destructive">{text.errors[requestError(saveError)]}</p>
        )}
        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? text.saving : text.save}</Button>
          {isSuccess && !isDirty && <span role="status" className="text-sm text-muted-foreground">{text.saved}</span>}
        </div>
      </form>
    </SettingsCard>
  );
}

function profileValues(profile: AccountProfile) {
  return {
    display_name: profile.display_name,
    avatar_url: profile.avatar_url ?? "",
  };
}

function ChangePasswordForm({ text }: { text: ProfileText }) {
  const [changePassword, { reset: clearPasswordRequest }] = useChangePasswordMutation();
  const [serverError, setServerError] = useState<RequestError>();
  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "" },
  });

  const { errors, isSubmitting } = formState;
  const currentPasswordError = errors.current_password && (
    errors.current_password.type === "incorrect" ? text.currentIncorrect : text.currentRequired
  );

  async function savePassword(values: ChangePasswordBody) {
    setServerError(undefined);
    const { error } = await changePassword(values);
    clearPasswordRequest();

    if (!error) {
      window.location.replace(loginUrl);
    } else if (getAuthError(error).field === "current_password") {
      setError("current_password", { type: "incorrect" }, { shouldFocus: true });
    } else {
      setServerError(requestError(error));
    }
  }

  return (
    <form onSubmit={handleSubmit(savePassword)} method="post" noValidate className="grid gap-4">
      <FormField
        {...register("current_password")}
        id="current-password"
        label={text.currentPassword}
        type="password"
        autoComplete="current-password"
        error={currentPasswordError}
        required
      />
      <FormField
        {...register("new_password")}
        id="new-password"
        label={text.newPassword}
        type="password"
        autoComplete="new-password"
        error={errors.new_password && text.passwordTooShort}
        required
      />
      {serverError && <p role="alert" className="text-sm text-destructive">{text.errors[serverError]}</p>}
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? text.changing : text.password}</Button>
        <DialogClose asChild>
          <Button type="button" variant="outline">{text.close}</Button>
        </DialogClose>
      </DialogFooter>
    </form>
  );
}

function Preferences({
  theme,
  isDark,
  language,
  text,
}: {
  theme: Theme;
  isDark: boolean;
  language: Language;
  text: ProfileText;
}) {
  return (
    <SettingsCard title={text.preferences}>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="profile-language" className="text-sm">{text.language}</label>
          <div data-slot="native-select-wrapper" className="relative w-48 max-w-[55%]">
            <Globe aria-hidden="true" className="pointer-events-none absolute top-2 left-2 size-4 text-muted-foreground" />
            <select
              data-slot="native-select"
              id="profile-language"
              className={selectStyle}
              value={language}
              onChange={(event) => savePreference(languageKey, event.target.value)}
            >
              <option value="en" lang="en">English</option>
              <option value="tg" lang="tg">Тоҷикӣ</option>
              <option value="ru" lang="ru">Русский</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <label htmlFor="profile-theme" className="text-sm">{text.theme}</label>
          <select
            data-slot="native-select"
            id="profile-theme"
            className={cn(selectStyle, "w-48 max-w-[55%]")}
            value={theme}
            onChange={(event) => savePreference(themeKey, event.target.value)}
          >
            <option value="system">{text.system}</option>
            <option value="light">{text.light}</option>
            <option value="dark">{text.dark}</option>
          </select>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="mt-2 justify-self-start">{text.password}</Button>
          </DialogTrigger>
          <DialogContent lang={language} translate="no" showCloseButton={false} className={cn(colors, isDark && "dark")}>
            <DialogHeader>
              <DialogTitle>{text.password}</DialogTitle>
              <DialogDescription>{text.passwordHint}</DialogDescription>
            </DialogHeader>
            <ChangePasswordForm text={text} />
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" className="absolute top-2 right-2" aria-label={text.close}>
                <X />
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </SettingsCard>
  );
}

function useProfilePreferences() {
  const savedLanguage = useSavedPreference(languageKey);
  const savedTheme = useSavedPreference(themeKey);
  const systemIsDark = useSyncExternalStore(
    subscribeToPreferences,
    () => window.matchMedia(systemTheme).matches,
    () => false,
  );

  const language: Language = savedLanguage === "tg" || savedLanguage === "ru" ? savedLanguage : "en";
  const theme: Theme = savedTheme === "dark" || savedTheme === "system" ? savedTheme : "light";
  const isDark = theme === "dark" || (theme === "system" && systemIsDark);

  return { language, theme, isDark };
}

function useSavedPreference(key: string) {
  return useSyncExternalStore(
    subscribeToPreferences,
    () => localStorage.getItem(key),
    () => null,
  );
}

function savePreference(key: string, value: string) {
  localStorage.setItem(key, value);
  // The storage event fires in other tabs. Notify this tab too.
  window.dispatchEvent(new Event(preferenceEvent));
}

function subscribeToPreferences(update: () => void) {
  const listeners = new AbortController();
  const options = { signal: listeners.signal };

  window.matchMedia(systemTheme).addEventListener("change", update, options);
  window.addEventListener(preferenceEvent, update, options);
  window.addEventListener("storage", update, options);

  return () => listeners.abort();
}

function requestError(error: unknown): RequestError {
  if (error && typeof error === "object" && "status" in error) {
    if (error.status === 401 || error.status === 403) return "sessionExpired";
    if (error.status === 429) return "tooManyAttempts";
    if (error.status === 400) return "invalidDetails";
  }

  return "requestFailed";
}

function ProfileAvatar({ profile }: { profile: AccountProfile }) {
  const [firstName, secondName = ""] = profile.display_name.trim().split(/\s+/);
  const initials = (firstName.charAt(0) + secondName.charAt(0)).toUpperCase();

  return (
    <Avatar.Root data-slot="avatar" className="relative flex size-8 shrink-0 overflow-hidden rounded-full">
      <Avatar.Image src={profile.avatar_url ?? undefined} referrerPolicy="no-referrer" alt="" className="size-full object-cover" />
      <Avatar.Fallback data-slot="avatar-fallback" className="flex size-full items-center justify-center bg-indigo-100 text-xs font-semibold text-indigo-700">
        {initials || "?"}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}

function SettingsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section data-slot="card" className="overflow-hidden rounded-lg border bg-card text-card-foreground">
      <h2 data-slot="card-header" className="border-b px-4 py-3 text-sm font-semibold">{title}</h2>
      <div data-slot="card-content" className="p-4">{children}</div>
    </section>
  );
}
