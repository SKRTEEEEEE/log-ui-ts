"use client"
import { updateUser } from "@log-ui/actions/user";
import { updateImg, uploadImg } from "@log-ui/actions/img";
import { Button } from "@/components/ui/button";
import { useActiveAccount } from "thirdweb/react";
import { signLoginPayload } from "thirdweb/auth";
import { generatePayload } from "@log-ui/actions/auth";
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

const FormButtonLabelDef = () => {
  return (
      <>
          <UserCog width={20} height={20} />
          <span className="inline-block sm:hidden px-2">Configuración</span>
          <p className="hidden sm:sr-only">Configuración usuario</p>
      </>
  );
};

const userSchema = z.object({
    nick: z.string().min(5, { message: "⚠️ Debe tener 5 caracteres como mínimo." }).max(25, { message: "⚠️ Debe tener 25 caracteres como máximo." }).optional(),
    img: z.string().nullable().optional(),
    email: z.string().email({ message: "El email debe ser válido" }).nullable().optional(),
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
  const account = useActiveAccount()
  const [previewImage, setPreviewImage] = useState<string | null>(user ? user.img : null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUser, setIsUser] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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
          {formButtonLabel||<FormButtonLabelDef/>} 
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            Editar perfil
          </DialogTitle>
          <DialogDescription className="text-xs">
            Editar tu información como usuario
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="nick"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nick</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="👾 De 5 a 25 caracteres" disabled={isFormDisabled} />
                  </FormControl>
                  <FormDescription>Este será tu nombre público.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''}  placeholder="ejemplo@correo.com" disabled={isFormDisabled} />
                  </FormControl>
                  <FormDescription>Email para verificación.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="picture">Imagen Perfil</Label>
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
                    Modificar imagen
                  </Button>
                </div>
              )}

              {!previewImage && (
                <Input 
                  id="picture" 
                  type="file" 
                  accept="image/*"
                  placeholder="Click para cargar una imagen" 
                  onChange={handleFileChange} 
                  disabled={isFormDisabled} 
                />
              )}
              <FormDescription className="text-xs">
                Tamaño máximo: 4MB. Formatos: PNG, JPG, GIF, WEBP
              </FormDescription>
            </div>
            
            <DialogFooter>
              <div className="flex w-full gap-4 flex-col">
                <div className="flex justify-end">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cerrar
                    </Button>
                  </DialogClose>
                </div>

                <Button
                  type="submit"
                  disabled={isFormDisabled || !account || isUploading}
                  className="w-full"
                >
                  {isUploading ? "Subiendo imagen..." : isFormDisabled ? "Inicia sesión para actualizar" : "Actualizar Perfil"}
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
