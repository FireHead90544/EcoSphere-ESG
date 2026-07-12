import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyGarden, getMyInventory, getShopItems } from "@/lib/actions/garden";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GardenView } from "@/components/gamification/GardenView";
import { ShopPanel } from "@/components/gamification/ShopPanel";
import { TreePine, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Virtual Garden — EcoSphere",
  description: "Grow your virtual garden with trees and earn growth points",
};

export default async function GardenPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [garden, inventory, shopItems] = await Promise.all([
    getMyGarden(),
    getMyInventory(),
    getShopItems(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Virtual Garden
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Plant trees, care for them, and earn growth points for the leaderboard.
        </p>
      </div>

      <Tabs defaultValue="garden" className="space-y-4">
        <TabsList>
          <TabsTrigger value="garden" className="gap-2">
            <TreePine className="size-4" />
            My Garden
          </TabsTrigger>
          <TabsTrigger value="shop" className="gap-2">
            <ShoppingBag className="size-4" />
            Shop
          </TabsTrigger>
        </TabsList>

        <TabsContent value="garden">
          {garden ? (
            <GardenView garden={garden} ecoCoins={garden.ecoCoins} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No employee record found for your account.
            </p>
          )}
        </TabsContent>

        <TabsContent value="shop">
          <ShopPanel
            items={shopItems}
            coinBalance={garden?.ecoCoins ?? 0}
            inventory={inventory.map((i) => ({
              shopItemId: i.shopItemId,
              quantity: i.quantity,
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
