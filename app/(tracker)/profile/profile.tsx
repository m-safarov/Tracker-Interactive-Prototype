"use client";

import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import {
  changePasswordSchema, profileFormSchema,
  type AccountProfile, type ChangePasswordBody, type UpdateProfileBody,
} from "@/features/auth/schema";
import { api, errorText } from "@/lib/api";
import translations from "./page-translations.json";

const t = translations.en;
const profileKey = ["profile"];
const nameFormSchema = profileFormSchema.pick({ display_name: true });
const photoTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const photoFileSchema = z.file()
  .min(1, t.invalidPhotoFile)
  .max(1024 * 1024, t.photoFileTooLarge)
  .mime(photoTypes, t.invalidPhotoFile);
const savedPhotoSchema = z.object({ name: z.string().min(1), src: z.string().startsWith("data:image/") });
type ProfilePhoto = z.infer<typeof savedPhotoSchema>;

function photoStorageKey(accountId: string) {
  return "tracker:profile-photo:" + accountId;
}

function loadSavedPhoto(accountId: string) {
  try {
    const stored = localStorage.getItem(photoStorageKey(accountId));
    const photo = savedPhotoSchema.safeParse(stored ? JSON.parse(stored) : null);
    return photo.success ? photo.data : null;
  } catch {
    return null;
  }
}

function readPhotoFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function loadProfile() {
  const { data } = await api.get<AccountProfile>("/auth/me", { baseURL: "/api" });
  return { ...data, savedPhoto: loadSavedPhoto(data.id) };
}

async function saveProfile(values: UpdateProfileBody) {
  const { data } = await api.patch<AccountProfile>("/auth/me", values, { baseURL: "/api" });
  return data;
}

async function changePassword(values: ChangePasswordBody) {
  await api.post("/auth/change-password", values, { baseURL: "/api" });
}

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const photoInput = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<ProfilePhoto | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [readingPhoto, setReadingPhoto] = useState(false);
  const profile = useQuery({
    queryKey: profileKey,
    queryFn: loadProfile,
    refetchOnWindowFocus: false,
    gcTime: 0,
  });
  const updateProfile = useMutation({
    mutationFn: ({ name }: { name: string; photo: ProfilePhoto | null }) => saveProfile({ display_name: name }),
    onSuccess: (updatedProfile, { photo }) => {
      if (photo) {
        try {
          localStorage.setItem(photoStorageKey(updatedProfile.id), JSON.stringify(photo));
          setSelectedPhoto(null);
        } catch {
          setPhotoError(t.photoSaveError);
        }
      }

      queryClient.setQueryData(profileKey, { ...updatedProfile, savedPhoto: loadSavedPhoto(updatedProfile.id) });
      queryClient.setQueryData(["current-account"], updatedProfile);
      return queryClient.invalidateQueries({ queryKey: profileKey });
    },
  });
  const updatePassword = useMutation({
    mutationFn: changePassword,
    gcTime: 0,
    onSuccess: () => router.replace("/sign-in"),
  });
  const profileForm = useForm({
    resolver: zodResolver(nameFormSchema),
    values: { display_name: profile.data?.display_name ?? "" },
  });
  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "" },
  });

  const field = "flex flex-col gap-[6px]";
  const cardHeader = "-mx-[16px] -mt-[16px] min-h-[48px] items-center border-b border-border px-[16px]";
  const preference = "flex flex-wrap items-center justify-between gap-[8px]";
  const select = "h-[32px] w-[194px] max-w-full";
  const errorClass = "text-[13px] text-destructive";
  const nameError = profileForm.formState.errors.display_name;
  const photo = selectedPhoto ?? profile.data?.savedPhoto;
  const photoStatus = photo?.name ?? (profile.data?.avatar_url ? t.currentPhoto : t.noPhoto);
  const savingProfile = updateProfile.isPending;
  const currentPasswordError = passwordForm.formState.errors.current_password;
  const newPasswordError = passwordForm.formState.errors.new_password;

  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    setPhotoError("");
    setSelectedPhoto(null);
    updateProfile.reset();

    const result = photoFileSchema.safeParse(file);
    if (!result.success) {
      setPhotoError(result.error.issues[0].message);
      return;
    }

    setReadingPhoto(true);
    try {
      const src = await readPhotoFile(file);
      const image = new Image();
      image.src = src;
      await image.decode();
      setSelectedPhoto({ name: file.name, src });
    } catch {
      setPhotoError(t.invalidPhotoFile);
    } finally {
      setReadingPhoto(false);
    }
  }

  function save(values: z.infer<typeof nameFormSchema>) {
    if (readingPhoto || savingProfile) return;
    setPhotoError("");
    updateProfile.mutate({ name: values.display_name, photo: selectedPhoto });
  }

  function clearPasswordForm(open: boolean) {
    if (!open) {
      passwordForm.reset();
      updatePassword.reset();
    }
  }

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar />
      <main className="min-w-0 flex-1">
        <PageHeading crumbs={[t.team, t.profile]} title={t.profile} />
        <div className="flex w-full max-w-[632px] flex-col gap-[16px] px-[24px] py-[28px] text-[13px]">
          <Card className="gap-[16px] pb-[20px]">
            <CardHeader className={cardHeader}><CardTitle>{t.profile}</CardTitle></CardHeader>
            {profile.isPending && <p role="status">{t.loading}</p>}
            {profile.isError && (
              <div className={field}>
                <p role="alert" className={errorClass}>{errorText(profile.error)}</p>
                <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => profile.refetch()}>
                  {t.retry}
                </Button>
              </div>
            )}
            {profile.isSuccess && (
              <>
                <Avatar
                  name={profile.data.display_name}
                  src={photo?.src ?? profile.data.avatar_url ?? undefined}
                  className="size-[32px]"
                />
                <form
                  method="post"
                  noValidate
                  onSubmit={profileForm.handleSubmit(save)}
                  aria-busy={savingProfile}
                  className="flex flex-col gap-[10px]"
                >
                  <div className={field}>
                    <Label htmlFor="profile-name">{t.name}</Label>
                    <Input
                      id="profile-name"
                      autoComplete="name"
                      readOnly={savingProfile}
                      aria-invalid={!!nameError}
                      aria-describedby={nameError ? "profile-name-error" : undefined}
                      {...profileForm.register("display_name")}
                    />
                    {nameError && <p id="profile-name-error" role="alert" className={errorClass}>{nameError.message}</p>}
                  </div>
                  <div className={field}>
                    <Label htmlFor="profile-photo">{t.photo}</Label>
                    <Input
                      id="profile-photo"
                      ref={photoInput}
                      type="file"
                      accept={photoTypes.join(",")}
                      className="hidden"
                      onChange={choosePhoto}
                      disabled={readingPhoto || savingProfile}
                    />
                    <div className="flex flex-wrap items-center gap-[8px]">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-describedby={photoError ? "profile-photo-status profile-photo-error" : "profile-photo-status"}
                        onClick={() => photoInput.current?.click()}
                        disabled={readingPhoto || savingProfile}
                      >
                        {t.choosePhoto}
                      </Button>
                      <span id="profile-photo-status" aria-live="polite" className="break-all text-muted-foreground">
                        {readingPhoto ? t.readingPhoto : photoStatus}
                      </span>
                    </div>
                    {photoError && <p id="profile-photo-error" role="alert" className={errorClass}>{photoError}</p>}
                  </div>
                  <div className={field}>
                    <Label htmlFor="profile-email">{t.email}</Label>
                    <Input id="profile-email" type="email" value={profile.data.email} readOnly />
                  </div>
                  <Button type="submit" size="sm" disabled={readingPhoto || savingProfile} className="mt-[12px] self-start">
                    {savingProfile ? t.saving : t.save}
                  </Button>
                  {updateProfile.isError && <p role="alert" className={errorClass}>{errorText(updateProfile.error)}</p>}
                  {updateProfile.isSuccess && !photoError && !profileForm.formState.isDirty && <p role="status">{t.saved}</p>}
                </form>
              </>
            )}
          </Card>
          <Card className="gap-[16px] pb-[18px]">
            <CardHeader className={cardHeader}><CardTitle>{t.preferences}</CardTitle></CardHeader>
            <div className={preference} role="group" aria-label={t.language}>
              <span>{t.language}</span>
              <Select defaultValue="en">
                <SelectTrigger className={select}><Globe className="size-[14px] text-muted-foreground" aria-hidden="true" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t.english}</SelectItem>
                  <SelectItem value="tg">{t.tajik}</SelectItem>
                  <SelectItem value="ru">{t.russian}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={preference} role="group" aria-label={t.theme}>
              <span>{t.theme}</span>
              <Select defaultValue="system">
                <SelectTrigger className={select}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">{t.system}</SelectItem>
                  <SelectItem value="light">{t.light}</SelectItem>
                  <SelectItem value="dark">{t.dark}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog onOpenChange={clearPasswordForm}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="mt-[8px] self-start">
                  {t.changePassword}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.changePassword}</DialogTitle>
                  <DialogDescription>{t.passwordHint}</DialogDescription>
                </DialogHeader>
                <form
                  method="post"
                  noValidate
                  onSubmit={passwordForm.handleSubmit((values) => updatePassword.mutate(values))}
                  aria-busy={updatePassword.isPending}
                  className="flex flex-col gap-[10px]"
                >
                  <div className={field}>
                    <Label htmlFor="profile-current-password">{t.currentPassword}</Label>
                    <Input
                      id="profile-current-password"
                      type="password"
                      autoComplete="current-password"
                      readOnly={updatePassword.isPending}
                      aria-invalid={!!currentPasswordError}
                      aria-describedby={currentPasswordError ? "profile-current-password-error" : undefined}
                      {...passwordForm.register("current_password")}
                    />
                    {currentPasswordError && (
                      <p id="profile-current-password-error" role="alert" className={errorClass}>{currentPasswordError.message}</p>
                    )}
                  </div>
                  <div className={field}>
                    <Label htmlFor="profile-new-password">{t.newPassword}</Label>
                    <Input
                      id="profile-new-password"
                      type="password"
                      autoComplete="new-password"
                      readOnly={updatePassword.isPending}
                      aria-invalid={!!newPasswordError}
                      aria-describedby={newPasswordError ? "profile-new-password-error" : undefined}
                      {...passwordForm.register("new_password")}
                    />
                    {newPasswordError && (
                      <p id="profile-new-password-error" role="alert" className={errorClass}>{newPasswordError.message}</p>
                    )}
                  </div>
                  {updatePassword.isError && <p role="alert" className={errorClass}>{errorText(updatePassword.error)}</p>}
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" size="sm" disabled={updatePassword.isPending}>{t.close}</Button>
                    </DialogClose>
                    <Button type="submit" size="sm" disabled={updatePassword.isPending}>
                      {updatePassword.isPending ? t.changing : t.changePassword}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </Card>
        </div>
      </main>
    </div>
  );
}
