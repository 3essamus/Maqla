import type { FC } from "react";
import { useMemo } from "react";

import { Box, Button, Group, Stack, Text, useMantineTheme } from "@mantine/core";
import { IconShoppingCart } from "@tabler/icons";

import type { ModalProps } from "@mantine/core";
import type { Image, MenuItem } from "@prisma/client";

import { useCart, type CartRestaurant } from "src/contexts/CartContext";

import { ImageKitImage } from "../ImageKitImage";
import { Modal } from "../Modal";

interface Props extends ModalProps {
    /** Menu item for which the modal needs to be displayed */
    menuItem?: MenuItem & { image: Image | null };
    /** Restaurant info for cart */
    restaurant?: CartRestaurant;
}

/** Modal to view details of a selected menu item */
export const ViewMenuItemModal: FC<Props> = ({ menuItem, restaurant, ...rest }) => {
    const theme = useMantineTheme();
    const { addItem, getItemQuantity, isEnabled } = useCart();

    const quantity = menuItem ? getItemQuantity(menuItem.id) : 0;
    const priceNum = menuItem ? parseFloat(menuItem.price.replace(/[^\d.-]/g, "")) || 0 : 0;

    const bgColor = useMemo(() => {
        if (menuItem?.image?.color) {
            if (theme.colorScheme === "light") {
                return theme.fn.lighten(menuItem?.image?.color, 0.85);
            }
            return theme.fn.darken(menuItem?.image?.color, 0.85);
        }
        return theme.white;
    }, [menuItem?.image?.color, theme.colorScheme]);

    const handleAddToCart = () => {
        if (menuItem && restaurant) {
            addItem(
                {
                    id: menuItem.id,
                    name: menuItem.name,
                    price: priceNum,
                    menuItemId: menuItem.id,
                },
                restaurant
            );
        }
    };

    return (
        <Modal
            centered
            data-testid="menu-item-card-modal"
            styles={{ modal: { background: bgColor } }}
            title={
                <Text color={theme.black} size="xl" weight="bold">
                    {menuItem?.name}
                </Text>
            }
            {...rest}
        >
            <Stack spacing="sm">
                {menuItem?.image?.path && (
                    <Box sx={{ borderRadius: theme.radius.lg, overflow: "hidden" }}>
                        <ImageKitImage
                            blurhash={menuItem?.image?.blurHash}
                            height={400}
                            imageAlt={menuItem?.name}
                            imagePath={menuItem?.image?.path}
                            width={400}
                        />
                    </Box>
                )}
                <Text color="red" mt="sm" size="lg" weight={600}>
                    {menuItem?.price}
                </Text>
                <Text color={theme.black} opacity={0.6}>
                    {menuItem?.description}
                </Text>

                {isEnabled && restaurant && menuItem && (
                    <Button
                        leftIcon={<IconShoppingCart size={18} />}
                        onClick={handleAddToCart}
                        size="md"
                        mt="md"
                        fullWidth
                    >
                        {quantity > 0 ? `Ajouter au panier (${quantity} déjà ajouté)` : "Ajouter au panier"}
                    </Button>
                )}
            </Stack>
        </Modal>
    );
};
