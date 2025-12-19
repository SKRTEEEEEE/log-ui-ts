"use client";

import { deleteUser } from "@log-ui/core/presentation/controllers/user";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { generatePayload } from "@log-ui/core/presentation/controllers/auth";
import { signLoginPayload } from "thirdweb/auth";
import { UserX } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

const getFormSchema = (t: (key: string) => string) => z.object({
    address: z.string(),
    validation: z.string().trim(),
}).refine((data) => data.validation.trim() === data.address.trim(), {
    message: t('validationError'),
    path: ['validation'],
});

export default function DeleteUserButton({ id, address }: { id: string; address: string }) {
    const t = useTranslations('userProfile');
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const formSchema = getFormSchema(t);
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            validation: "",
            address: address,
        }
    });

    const onSubmit = async () => {
        if (!account) {
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
            // Error is already handled by the controller with DomainError
            throw error;
        }
    };

    return (
        <Dialog>
            <DialogTrigger className="gap-4" asChild>
                <Button variant="destructive" disabled={!account}>
                    <UserX />
                    {t('deleteAccount')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('deleteUser')}</DialogTitle>
                    <DialogDescription>
                        {t('deleteWarning')} <b>&quot;{address}&quot;</b> {t('deleteWarningEnd')}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField control={form.control} name="validation" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('verification')}</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder={t('verificationPlaceholder')} />
                                </FormControl>
                                <FormMessage/>
                                <FormDescription>
                                    {t('deleteDescription')}
                                </FormDescription>
                            </FormItem>
                        )} />
                        <DialogFooter className="flex">
                            <Button variant="destructive" disabled={!account} type="submit">
                                <UserX /> {t('delete')}
                            </Button>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    {t('close')}
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
