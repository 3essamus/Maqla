import { Badge, Center, Group, Loader, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { type NextPage } from "next";
import { NextSeo } from "next-seo";

import { AdminLayout } from "src/components/AdminLayout";
import { api } from "src/utils/api";

const AdminUsers: NextPage = () => {
    const { data: usersData, isLoading } = api.admin.getUsers.useQuery();

    if (isLoading) {
        return (
            <AdminLayout>
                <Center h="50vh">
                    <Loader size="lg" />
                </Center>
            </AdminLayout>
        );
    }

    const getTierBadge = (tier: string, expiresAt: Date | null) => {
        const isPaid = tier === "PAID";
        const isExpired = expiresAt && new Date(expiresAt) < new Date();

        if (isPaid && isExpired) {
            return <Badge color="orange">Payant (Expiré)</Badge>;
        }

        return (
            <Badge color={isPaid ? "yellow" : "gray"} variant="filled">
                {isPaid ? "Payant" : "Gratuit"}
            </Badge>
        );
    };

    return (
        <>
            <NextSeo title="Admin - Utilisateurs" />
            <AdminLayout>
                <Stack spacing="xl">
                    <div>
                        <Title order={1}>Utilisateurs</Title>
                        <Text color="dimmed">Gérer les utilisateurs de la plateforme</Text>
                    </div>

                    <Paper p="md" radius="md" withBorder>
                        <Stack spacing="md">
                            <Group position="apart">
                                <Title order={3}>Tous les utilisateurs</Title>
                                <Text size="sm" color="dimmed">
                                    {usersData?.total ?? 0} utilisateur(s)
                                </Text>
                            </Group>
                            <div style={{ overflowX: "auto" }}>
                                <Table striped highlightOnHover>
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Nom</th>
                                            <th>Rôle</th>
                                            <th>Forfait</th>
                                            <th>Restaurants</th>
                                            <th>Expiration</th>
                                            <th>Inscrit le</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersData?.users.map((user) => (
                                            <tr key={user.id}>
                                                <td>
                                                    <Text size="sm">{user.email}</Text>
                                                </td>
                                                <td>
                                                    <Text size="sm">{user.name || "-"}</Text>
                                                </td>
                                                <td>
                                                    <Badge color={user.role === "ADMIN" ? "red" : "blue"}>
                                                        {user.role === "ADMIN" ? "Admin" : "Utilisateur"}
                                                    </Badge>
                                                </td>
                                                <td>{getTierBadge(user.tier, user.tierExpiresAt)}</td>
                                                <td>
                                                    <Text size="sm">{user._count.restaurants}</Text>
                                                </td>
                                                <td>
                                                    {user.tierExpiresAt ? (
                                                        <Text size="sm">
                                                            {new Date(user.tierExpiresAt).toLocaleDateString("fr-FR")}
                                                        </Text>
                                                    ) : (
                                                        <Text size="sm" color="dimmed">
                                                            -
                                                        </Text>
                                                    )}
                                                </td>
                                                <td>
                                                    <Text size="sm">
                                                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                                                    </Text>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                {usersData?.users.length === 0 && (
                                    <Center py="xl">
                                        <Text color="dimmed">Aucun utilisateur</Text>
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
    props: { messages: (await import("src/lang/fr.json")).default },
    revalidate: 60,
});

export default AdminUsers;
