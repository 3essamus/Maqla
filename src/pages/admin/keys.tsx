import { useState } from "react";

import {
    Badge,
    Button,
    Center,
    Group,
    Loader,
    NumberInput,
    Paper,
    Select,
    Stack,
    Table,
    Text,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconKey } from "@tabler/icons";
import { type NextPage } from "next";
import { NextSeo } from "next-seo";

import { AdminLayout } from "src/components/AdminLayout";
import { api } from "src/utils/api";

const AdminKeys: NextPage = () => {
    const [generating, setGenerating] = useState(false);
    const { data: keysData, isLoading, refetch } = api.admin.getKeys.useQuery();

    const generateKeyMutation = api.admin.generateKey.useMutation({
        onSuccess: () => {
            showNotification({
                title: "Clé générée",
                message: "La clé d'activation a été créée avec succès",
                color: "green",
                icon: <IconCheck />,
            });
            form.reset();
            setGenerating(false);
            refetch();
        },
        onError: (error) => {
            showNotification({
                title: "Erreur",
                message: error.message,
                color: "red",
            });
            setGenerating(false);
        },
    });

    const form = useForm({
        initialValues: {
            tier: "FREE",
            expiresInDays: 365,
        },
    });

    const handleGenerate = (values: typeof form.values) => {
        setGenerating(true);
        generateKeyMutation.mutate({
            tier: values.tier as "FREE" | "PAID",
            expiresInDays: values.expiresInDays,
        });
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            UNUSED: "blue",
            USED: "green",
            EXPIRED: "red",
        };
        return (
            <Badge color={colors[status] || "gray"} variant="filled">
                {status === "UNUSED" ? "Disponible" : status === "USED" ? "Utilisée" : "Expirée"}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <Center h="50vh">
                    <Loader size="lg" />
                </Center>
            </AdminLayout>
        );
    }

    return (
        <>
            <NextSeo title="Admin - Clés d'activation" />
            <AdminLayout>
                <Stack spacing="xl">
                    <div>
                        <Title order={1}>Clés d'activation</Title>
                        <Text color="dimmed">Générer et gérer les clés d'activation pour les utilisateurs</Text>
                    </div>

                    {/* Generate Key Form */}
                    <Paper p="md" radius="md" withBorder>
                        <form onSubmit={form.onSubmit(handleGenerate)}>
                            <Stack spacing="md">
                                <Title order={3}>Générer une nouvelle clé</Title>
                                <Group grow align="flex-start">
                                    <Select
                                        label="Type de forfait"
                                        placeholder="Sélectionner"
                                        data={[
                                            { value: "FREE", label: "Gratuit (5 articles)" },
                                            { value: "PAID", label: "Payant (Illimité)" },
                                        ]}
                                        {...form.getInputProps("tier")}
                                        required
                                    />
                                    <NumberInput
                                        label="Expiration (jours)"
                                        placeholder="365"
                                        min={1}
                                        max={3650}
                                        {...form.getInputProps("expiresInDays")}
                                        required
                                    />
                                </Group>
                                <Button
                                    type="submit"
                                    leftIcon={<IconKey size={18} />}
                                    loading={generating}
                                    sx={{ alignSelf: "flex-start" }}
                                >
                                    Générer la clé
                                </Button>
                            </Stack>
                        </form>
                    </Paper>

                    {/* Keys Table */}
                    <Paper p="md" radius="md" withBorder>
                        <Stack spacing="md">
                            <Group position="apart">
                                <Title order={3}>Toutes les clés</Title>
                                <Text size="sm" color="dimmed">
                                    {keysData?.total ?? 0} clé(s) au total
                                </Text>
                            </Group>
                            <div style={{ overflowX: "auto" }}>
                                <Table striped highlightOnHover>
                                    <thead>
                                        <tr>
                                            <th>Clé</th>
                                            <th>Type</th>
                                            <th>Statut</th>
                                            <th>Utilisateur</th>
                                            <th>Créée le</th>
                                            <th>Expire le</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {keysData?.keys.map((key) => (
                                            <tr key={key.id}>
                                                <td>
                                                    <Text size="xs" sx={{ fontFamily: "monospace" }}>
                                                        {key.key}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <Badge color={key.tier === "PAID" ? "yellow" : "gray"}>
                                                        {key.tier === "PAID" ? "Payant" : "Gratuit"}
                                                    </Badge>
                                                </td>
                                                <td>{getStatusBadge(key.status)}</td>
                                                <td>
                                                    {key.user ? (
                                                        <Text size="sm">{key.user.email}</Text>
                                                    ) : (
                                                        <Text size="sm" color="dimmed">
                                                            Non utilisée
                                                        </Text>
                                                    )}
                                                </td>
                                                <td>
                                                    <Text size="sm">
                                                        {new Date(key.createdAt).toLocaleDateString("fr-FR")}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <Text size="sm">
                                                        {new Date(key.expiresAt).toLocaleDateString("fr-FR")}
                                                    </Text>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                {keysData?.keys.length === 0 && (
                                    <Center py="xl">
                                        <Text color="dimmed">Aucune clé générée</Text>
                                    </Center>
                                )}
                            </div>
                        </Stack>
                    </Paper>
                </Stack>
            </AdminLayout>
        </>
    );
};

export const getStaticProps = async () => ({
    props: { messages: (await import("src/lang/en.json")).default },
    revalidate: 60,
});

export default AdminKeys;
