import { Form, Head } from "@inertiajs/react";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { store } from "@/routes/login";
import { request } from "@/routes/password";
import PasskeyVerify from "@/components/passkey-verify";
import { ArrowRight, KeyRound } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={`${t("common.signIn")}`} />

            <PasskeyVerify />

            {status && (
                <div className="mb-4 rounded-sm border border-gov-success-border bg-gov-success-bg p-3 text-xs font-medium text-gov-success-text">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={["password"]}
                className="flex flex-col gap-4 text-xs"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-medium text-gov-text"
                                >
                                    {t("auth.email")}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="name@company.de"
                                    className="h-9 rounded-lg border-gov-border bg-gov-surface text-xs text-gov-text placeholder:text-gov-muted focus-visible:ring-1 focus-visible:ring-gov-interactive"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs font-medium text-gov-text"
                                    >
                                        {t("auth.password")}
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-[11px] text-gov-interactive hover:underline"
                                            tabIndex={5}
                                        >
                                            {t("auth.forgotPassword")}
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-9 rounded-lg border-gov-border bg-gov-surface text-xs text-gov-text placeholder:text-gov-muted focus-visible:ring-1 focus-visible:ring-gov-interactive"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded-sm border-gov-border data-[state=checked]:bg-gov-interactive data-[state=checked]:border-gov-interactive"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-xs font-normal text-gov-muted cursor-pointer"
                                >
                                    {t("auth.rememberMe")}
                                </Label>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            tabIndex={4}
                            disabled={processing}
                            className="mt-2 h-10 w-full rounded-lg bg-gov-interactive text-xs font-medium text-white transition-colors hover:bg-gov-interactive-hover cursor-pointer"
                        >
                            {processing ? (
                                <Spinner className="mr-2 h-4 w-4" />
                            ) : (
                                <span className="inline-flex items-center justify-center gap-1.5">
                                    {t("auth.signInButton")}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                            )}
                        </Button>

                        {canResetPassword && (
                            <div className="mt-3 border-t border-gov-border pt-3 text-center text-xs text-gov-muted">
                                <span>
                                    First time login or need to set your
                                    password?{" "}
                                </span>
                                <TextLink
                                    href={request()}
                                    className="font-medium text-gov-interactive hover:underline"
                                >
                                    Set Password
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </>
    );
}
