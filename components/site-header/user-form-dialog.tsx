"use client"
import { updateUser } from "@log-ui/core/presentation/controllers/user";
import { updateImg, uploadImg } from "@log-ui/core/presentation/controllers/img";
import { Button } from "@/components/ui/button";
import { useActiveAccount } from "thirdweb/react";
import { signLoginPayload } from "thirdweb/auth";
import { generatePayload } from "@log-ui/core/presentation/controllers/auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState, type JSX } from "react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { UserCog } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DeleteUserButton from "./delete-user-button";
import Image from "next/image";
import { VerificacionEmailAlert } from "./verificacion-email-alert";
import SolicitudRoleButton from "./solicitud-role";
import { useTranslations } from "next-intl";

const FormButtonLabelDef = ({ t }: { t: any }) => {
  return (
      <>
          <UserCog width={20} height={20} />
          <span className="inline-block sm:hidden px-2">{t('config')}</span>
          <p className="hidden sm:sr-only">{t('configUser')}</p>
      </>
  );
};

const getUserSchema = (t: any) => z.object({
    nick: z.string().min(5, { message: t('nickMinError') }).max(25, { message: t('nickMaxError') }).optional(),
    img: z.string().nullable().optional(),
    email: z.string().email({ message: t('emailError') }).nullable().optional(),
  })

type User = {
  id: string;
  nick: string | null;
  img: string | null;
  email: string | null;
  address: string;
  role: string | null;
  isVerified: boolean;
  solicitud: string | null;
}

export default function UserFormDialog({ 
  user, 
  formButtonLabel, 
  buttonLabelVariant="outline", 
  buttonLabelClass="px-2",
  onUserUpdate
}: { 
  user: User | false | null, 
  formButtonLabel?: JSX.Element, 
  buttonLabelVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined, 
  buttonLabelClass?:string,
  onUserUpdate?: () => void
}) {
  const t = useTranslations('userProfile')
  const account = useActiveAccount()
  const [previewImage, setPreviewImage] = useState<string | null>(user ? user.img : null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUser, setIsUser] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const userSchema = getUserSchema(t)
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nick: "",
      img: null,
      email: undefined,
    },
  });

  useEffect(() => {
    form.reset({
      nick: user ? user.nick! : "",
      img: user ? user.img : null,
      email: user ? user.email || undefined : undefined,
    });
    setPreviewImage(user ? user.img : null);
    setSelectedFile(null);
    setIsUser(user ? true : false)
  }, [user, account, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file);

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
  }

  const setImageData = async () => {
    if (!selectedFile || !user) return

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('img', selectedFile);

      let imageUrl: string;
      if (user.img) {
        imageUrl = await updateImg(formData, user.img);
      } else {
        imageUrl = await uploadImg(formData);
      }
      form.setValue("img", imageUrl)
      return imageUrl;
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(formData: z.infer<typeof userSchema>) {
    if (!account || !user) {
      console.error("Please connect your wallet or log in")
      return
    }

    try {
      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile !== null) {
        await setImageData()
      }

      const payload = await generatePayload({ address: account.address })
      const signatureRes = await signLoginPayload({ account, payload })
      const updatedData = {
        ...formData,
        email: (typeof formData.email === "string") ? formData.email : null,
        img: form.getValues().img || null
      };

      await updateUser(user.id, signatureRes, updatedData);
      
      // Cerrar el diálogo y notificar actualización
      setIsOpen(false)
      if (onUserUpdate) {
        onUserUpdate()
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  }

  const isFormDisabled = !user

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={buttonLabelClass} variant={buttonLabelVariant}>
          {formButtonLabel||<FormButtonLabelDef t={t} />} 
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {t('editProfile')}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t('editInfo')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="nick"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nick')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('nickPlaceholder')} disabled={isFormDisabled} />
                  </FormControl>
                  <FormDescription>{t('nickDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''}  placeholder={t('emailPlaceholder')} disabled={isFormDisabled} />
                  </FormControl>
                  <FormDescription>{t('emailDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="picture">{t('profileImage')}</Label>
              {previewImage && (
                <div className="flex items-center justify-between sm:w-[400px]">
                  <Image 
                    src={previewImage} 
                    id="picture" 
                    alt="Imagen de perfil" 
                    width={60} 
                    height={60} 
                    className="rounded-xl border-border border-2" 
                  />
                  <Button 
                    type="button"
                    variant={"secondary"} 
                    className="my-auto" 
                    onClick={() => {
                      setPreviewImage(null);
                      setSelectedFile(null);
                    }} 
                    disabled={isFormDisabled}
                  >
                    {t('modifyImage')}
                  </Button>
                </div>
              )}

              {!previewImage && (
                <Input 
                  id="picture" 
                  type="file" 
                  accept="image/*"
                  placeholder={t('clickToLoadImage')} 
                  onChange={handleFileChange} 
                  disabled={isFormDisabled} 
                />
              )}
              <FormDescription className="text-xs">
                {t('imageDescription')}
              </FormDescription>
            </div>
            
            <DialogFooter>
              <div className="flex w-full gap-4 flex-col">
                <div className="flex justify-end">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      {t('close')}
                    </Button>
                  </DialogClose>
                </div>

                <Button
                  type="submit"
                  disabled={isFormDisabled || !account || isUploading}
                  className="w-full"
                >
                  {isUploading ? t('uploadingImage') : isFormDisabled ? t('loginToUpdate') : t('updateProfile')}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
        <Separator className="my-2" />
        {isUser && user && user.email && <VerificacionEmailAlert user={user} />}
        <div className="grid grid-cols-2 gap-4">
          <div>
            {isUser && user && !user.solicitud && user.email && user.role === null && (
              <SolicitudRoleButton id={user.id} />
            )}
          </div>
          {isUser && user && <DeleteUserButton id={user.id} address={user.address} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
