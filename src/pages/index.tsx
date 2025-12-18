import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Box, Center, Container, Loader, SimpleGrid, Text, Title, useMantineTheme } from "@mantine/core";
import { type NextPage } from "next";
import { useTranslations } from "next-intl";
import { NextSeo } from "next-seo";

import { ImageCard } from "src/components/Cards";
import { Empty } from "src/components/Empty";
import { Footer } from "src/components/Footer";
import { NavHeader } from "src/components/Header";
import { api } from "src/utils/api";
import { showErrorToast } from "src/utils/helpers";

/** Public homepage - Explore all published restaurants in Jijel */
const HomePage: NextPage = () => {
    const theme = useMantineTheme();
    const t = useTranslations("dashboard.explore");
    const [itemsParent] = useAutoAnimate<HTMLDivElement>();

    const { data: restaurants = [], isLoading } = api.restaurant.getAllPublished.useQuery(undefined, {
        onError: () => showErrorToast(t("fetchError")),
    });

    return (
        <>
            <NextSeo
                description="Découvrez les meilleurs restaurants de Jijel. Parcourez les menus, consultez les avis et commandez directement via WhatsApp."
                title="Maqla - Restaurants de Jijel"
            />
            <main>
                <NavHeader showInternalLinks={false} />
                <Container py="xl" size="xl">
                    <Title order={1}>Restaurants de Jijel</Title>
                    <Text color={theme.colors.dark[6]}>
                        Découvrez et commandez depuis les meilleurs restaurants de la ville
                    </Text>
                    <Box ref={itemsParent}>
                        <SimpleGrid
                            breakpoints={[
                                { cols: 3, minWidth: "lg" },
                                { cols: 2, minWidth: "sm" },
                                { cols: 1, minWidth: "xs" },
                            ]}
                            mt="xl"
                        >
                            {restaurants?.map((item) => (
                                <ImageCard
                                    key={item.id}
                                    href={`/restaurant/${item.id}/menu`}
                                    image={item.image}
                                    subTitle={item.location}
                                    target="_blank"
                                    testId={`explore-card ${item.name}`}
                                    title={item.name}
                                />
                            ))}
                        </SimpleGrid>
                        {isLoading && (
                            <Center h="50vh" w="100%">
                                <Loader size="lg" />
                            </Center>
                        )}
                        {!isLoading && restaurants?.length === 0 && (
                            <Empty height="50vh" text="Aucun restaurant disponible pour le moment" />
                        )}
                    </Box>
                </Container>
                <Footer />
            </main>
        </>
    );
};

export const getStaticProps = async () => ({
    props: { messages: (await import("src/lang/en.json")).default },
    revalidate: 300, // Revalidate every 5 minutes
});

export default HomePage;
