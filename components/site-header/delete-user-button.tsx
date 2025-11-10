"use client";

import { deleteUser } from "@log-ui/actions/user";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { generatePayload } from "@log-ui/actions/auth";
import { signLoginPayload } from "thirdweb/auth";
import { UserX } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
    address: z.string(),
    validation: z.string().trim(),
}).refine((data) => data.validation.trim() === data.address.trim(), {
    message: "El valor de validación debe coincidir con la dirección.",
    path: ['validation'],
});

export default function DeleteUserButton({ id, address }: { id: string; address: string }) {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            validation: "",
            address: address,
        }
    });

    const onSubmit = async () => {
        if (!account) {
            console.error("Please connect your wallet");
            return;
        }
        try {
            const payload = await generatePayload({ address: account.address });
            const signatureRes = await signLoginPayload({ account, payload });
            await deleteUser(signatureRes, id, address);
            if (wallet) {
                wallet.disconnect();
            }
        } catch (error) {
            console.error("Error at delete user: " + error);
        }
    };

    return (
        <Dialog>
            <DialogTrigger className="gap-4" asChild>
                <Button variant="destructive" disabled={!account}>
                    <UserX />
                    Eliminar cuenta
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar usuario</DialogTitle>
                    <DialogDescription>
                        Acción irreversible, introduce <b>&quot;{address}&quot;</b> para eliminar tu cuenta.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField control={form.control} name="validation" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Verificación</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Introduce aquí tu dirección" />
                                </FormControl>
                                <FormMessage/>
                                <FormDescription>
                                    Una vez realizada esta acción perderás toda tu información como cursos realizados o privilegios.
                                </FormDescription>
                            </FormItem>
                        )} />
                        <DialogFooter className="flex">
                            <Button variant="destructive" disabled={!account} type="submit">
                                <UserX /> Eliminar
                            </Button>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cerrar
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
