import type { FC } from "react";
import { useMemo, useState } from "react";

import { ActionIcon, Badge, Box, createStyles, Group, Paper, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons";

import type { Image, MenuItem } from "@prisma/client";

import { useCart, type CartRestaurant } from "src/contexts/CartContext";

import { ViewMenuItemModal } from "./ViewMenuItemModal";
import { ImageKitImage } from "../ImageKitImage";

export interface StyleProps {
    imageColor?: string;
}

const useStyles = createStyles((theme, { imageColor }: StyleProps, getRef) => {
    const image = getRef("image");

    const bgColor = useMemo(() => {
        if (imageColor) {
            if (theme.colorScheme === "light") {
                return theme.fn.lighten(imageColor, 0.95);
            }
            return theme.fn.darken(imageColor, 0.95);
        }
        return theme.colors.dark[0];
    }, [imageColor, theme.colorScheme]);

    return {
        cardDescWrap: { flex: 1, gap: 0, overflow: "hidden", padding: theme.spacing.lg },
        cardImage: { height: 150, ref: image, transition: "transform 500ms ease", width: 150 },
        cardImageWrap: {
            borderRadius: theme.radius.lg,
            height: 150,
            overflow: "hidden",
            position: "relative",
            width: 150,
        },
        cardItem: {
            "&:hover": {
                backgroundColor:
                    theme.colorScheme === "light" ? theme.fn.darken(bgColor, 0.05) : theme.fn.lighten(bgColor, 0.05),
                boxShadow: theme.shadows.xs,
            },
            backgroundColor: bgColor,
            border: `1px solid ${theme.colors.dark[3]}`,
            color: theme.colors.dark[8],
            cursor: "pointer",
            display: "flex",
            overflow: "hidden",
            padding: "0 !important",
            transition: "all 500ms ease",
            [`&:hover .${image}`]: { transform: "scale(1.05)" },
        },
        cardItemDesc: { WebkitLineClamp: 3 },
        cardItemTitle: { WebkitLineClamp: 1 },
        cardText: {
            WebkitBoxOrient: "vertical",
            color: theme.black,
            display: "-webkit-box",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
        },
    };
});

interface Props {
    /** Menu item to be displayed in the card */
    item: MenuItem & { image: Image | null };
    /** Restaurant info for cart */
    restaurant?: CartRestaurant;
}

/** Display each menu item as a card in the full restaurant menu */
export const MenuItemCard: FC<Props> = ({ item, restaurant }) => {
    const { classes, cx } = useStyles({ imageColor: item?.image?.color });
    const [modalVisible, setModalVisible] = useState(false);
    const { addItem, getItemQuantity, isEnabled } = useCart();

    const quantity = getItemQuantity(item.id);
    const priceNum = parseFloat(item.price.replace(/[^\d.-]/g, "")) || 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (restaurant) {
            addItem(
                {
                    id: item.id,
                    name: item.name,
                    price: priceNum,
                    menuItemId: item.id,
                },
                restaurant
            );
        }
    };

    return (
        <>
            <Paper
                className={classes.cardItem}
                data-testid="menu-item-card"
                h={150}
                onClick={() => setModalVisible(true)}
            >
                {item?.image?.path && (
                    <Box className={classes.cardImageWrap}>
                        <Box className={classes.cardImage}>
                            <ImageKitImage
                                blurhash={item?.image?.blurHash}
                                color={item?.image?.color}
                                height={150}
                                imageAlt={item.name}
                                imagePath={item?.image?.path}
                                width={150}
                            />
                        </Box>
                    </Box>
                )}

                <Stack className={classes.cardDescWrap}>
                    <Group position="apart" align="start">
                        <Text className={cx(classes.cardText, classes.cardItemTitle)} size="lg" weight={700}>
                            {item.name}
                        </Text>
                        {isEnabled && restaurant && (
                            <ActionIcon
                                color="blue"
                                variant="filled"
                                size="md"
                                radius="xl"
                                onClick={handleAddToCart}
                                title="Ajouter au panier"
                            >
                                <IconPlus size={16} />
                            </ActionIcon>
                        )}
                    </Group>
                    <Group position="apart" align="center">
                        <Text color="red" size="sm" weight={600}>
                            {item.price}
                        </Text>
                        {quantity > 0 && (
                            <Badge color="blue" variant="filled" size="sm">
                                {quantity} dans le panier
                            </Badge>
                        )}
                    </Group>
                    <Text className={cx(classes.cardText, classes.cardItemDesc)} opacity={0.7} size="xs">
                        {item.description}
                    </Text>
                </Stack>
            </Paper>
            <ViewMenuItemModal
                menuItem={item}
                restaurant={restaurant}
                onClose={() => setModalVisible(false)}
                opened={modalVisible}
            />
        </>
    );
};
