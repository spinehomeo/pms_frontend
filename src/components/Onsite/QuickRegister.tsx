import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { PatientsService } from "@/client"
import type { OnsitePatientDetails } from "@/client/PatientsService"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const registerSchema = z.object({
    full_name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be at most 100 characters"),
    phone: z.string().min(1, "Phone number is required"),
    gender: z.string().optional(),
    city: z.string().optional(),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
})

type RegisterFormData = z.infer<typeof registerSchema>

interface QuickRegisterProps {
    defaultPhone?: string
    defaultName?: string
    onSuccess: (patient: OnsitePatientDetails) => void
    onBack: () => void
}

export function QuickRegister({
    defaultPhone,
    defaultName,
    onSuccess,
    onBack,
}: QuickRegisterProps) {
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            full_name: defaultName || "",
            phone: defaultPhone || "",
            gender: "",
            city: "",
            email: "",
        },
    })

    const mutation = useMutation({
        mutationFn: (data: RegisterFormData) =>
            PatientsService.onsiteQuickRegister({
                full_name: data.full_name,
                phone: data.phone,
                gender: data.gender || undefined,
                city: data.city || undefined,
                email: data.email || undefined,
            }),
        onSuccess: (patient) => {
            showSuccessToast("Patient registered successfully")
            onSuccess(patient)
        },
        onError: handleError.bind(showErrorToast),
    })

    const onSubmit = (data: RegisterFormData) => {
        mutation.mutate(data)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Register</CardTitle>
                <CardDescription>
                    Register a new walk-in patient with minimal information. Other details
                    can be updated later.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Full Name <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Full Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Phone <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="03001234567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gender</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="City" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="patient@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onBack}
                                disabled={mutation.isPending}
                            >
                                Back
                            </Button>
                            <LoadingButton type="submit" loading={mutation.isPending}>
                                Register Patient
                            </LoadingButton>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
