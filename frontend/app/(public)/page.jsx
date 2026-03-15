'use client'
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";
import FollowedStoreProducts from "@/components/FollowedStoreProducts";

export default function Home() {
    return (
        <div>
            <Hero />
            <LatestProducts />
            <FollowedStoreProducts />
            <BestSelling />
            <OurSpecs />
            <Newsletter />
        </div>
    );
}
