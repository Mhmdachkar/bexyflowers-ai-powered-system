import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCartWithToast } from "@/hooks/useCartWithToast";
import { Card, CardContent } from "@/components/ui/card";
import { getProductImageAlt } from "@/lib/imageAltUtils";
import bouquet1 from "@/assets/bouquet-1.jpg";
import bouquet2 from "@/assets/bouquet-2.jpg";
import bouquet3 from "@/assets/bouquet-3.jpg";
import bouquet4 from "@/assets/bouquet-4.jpg";
import bouquet5 from "@/assets/bouquet-5.jpg";
import bouquet6 from "@/assets/bouquet-6.jpg";

const bouquets = [
  {
    id: 1,
    name: "Crimson Elegance",
    price: "$189",
    image: bouquet1,
    description: "Premium red roses with gold ribbon"
  },
  {
    id: 2,
    name: "Ivory Perfection",
    price: "$225",
    image: bouquet2,
    description: "White peonies with golden eucalyptus"
  },
  {
    id: 3,
    name: "Garden Romance",
    price: "$195",
    image: bouquet3,
    description: "Mixed luxury arrangement"
  },
  {
    id: 4,
    name: "Royal Orchid",
    price: "$285",
    image: bouquet4,
    description: "Purple orchids with gold foliage"
  },
  {
    id: 5,
    name: "Golden Harvest",
    price: "$165",
    image: bouquet5,
    description: "Sunflowers with golden wheat"
  },
  {
    id: 6,
    name: "Champagne Dreams",
    price: "$245",
    image: bouquet6,
    description: "Champagne roses with baby's breath"
  }
];

const FeaturedBouquets = () => {
  const { addToCart } = useCartWithToast();

  return (
    <section className="py-20 px-4 bg-gradient-platinum">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-luxury text-5xl md:text-6xl font-bold text-foreground mb-4">
            Trending Bouquets
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {bouquets.map((bouquet, index) => (
            <motion.div
              key={bouquet.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              viewport={{ once: true }}
            >
              <Card className="group overflow-hidden bg-card border-2 border-border/50 shadow-platinum hover:shadow-luxury transition-luxury">
                <div className="relative overflow-hidden">
                  <img
                    src={bouquet.image}
                    alt={getProductImageAlt(bouquet)}
                    className="w-full h-64 object-cover transition-luxury group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-luxury" />
                  
                  {/* Hover Button */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-luxury"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Button
                      variant="default"
                      className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-full shadow-gold"
                    >
                      View Details
                    </Button>
                  </motion.div>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-luxury text-2xl font-semibold text-foreground mb-2">
                    {bouquet.name}
                  </h3>
                  <p className="font-body text-muted-foreground mb-4">
                    {bouquet.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-luxury text-3xl font-bold text-primary">
                      {bouquet.price}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-luxury"
                      onClick={() => {
                        const priceNumber = parseFloat(String(bouquet.price).replace("$", ""));
                        addToCart({
                          id: bouquet.id as number,
                          title: bouquet.name,
                          price: priceNumber,
                          image: bouquet.image
                        });
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Button
            variant="outline"
            size="lg"
            className="font-body text-lg px-10 py-4 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-luxury"
          >
            View All Bouquets
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedBouquets;