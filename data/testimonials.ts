
export interface Testimonial {
    id: number;
    name: string;
    location: string;
    role: string;
    rating: number;
    text: string;
    product: string;
}

export const TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        name: "Elena R.",
        location: "Milan, Italy",
        role: "Verified Client",
        rating: 5,
        text: "The architectural drape of the wool coat is simply unmatched. It fits perfectly over my tailored suits without adding bulk. The fabric quality is noticeably superior to my previous investment pieces.",
        product: "Elite Woolen Short Coat"
    },
    {
        id: 2,
        name: "James T.",
        location: "London, UK",
        role: "VIP Member",
        rating: 5,
        text: "Ordered the Cashmere Overcoat for my winter commute. The thermal regulation is excellent—warm without overheating. Packaging was pristine, and the unboxing felt like a true luxury experience.",
        product: "Heritage Cashmere Overcoat"
    },
    {
        id: 3,
        name: "Isabella Chen",
        location: "Singapore",
        role: "Private Client",
        rating: 5,
        text: "Maison Klyora has ruined other brands for me. The 'Find My Fit' AI recommended a Size S, and the silhouette is flawless. The silk lining details are what truly separate this from mass luxury.",
        product: "Silk Evening Gown"
    },
    {
        id: 4,
        name: "Alexander V.",
        location: "Zurich, CH",
        role: "Verified Client",
        rating: 4.8,
        text: "Attention to detail is impeccable. The stitching on the leather accessories is precise, reminiscent of old-world craftsmanship. Shipping was surprisingly fast for an international order.",
        product: "Structured Leather Briefcase"
    },
    {
        id: 5,
        name: "Sophie Durham",
        location: "New York, USA",
        role: "VIP Member",
        rating: 5,
        text: "I was skeptical about buying ready-to-wear online, but the 'Concierge' service answered every question about the fabric weight. The piece arrived and exceeded expectations.",
        product: "Cashmere Turtleneck"
    },
    {
        id: 6,
        name: "Marcus L.",
        location: "Toronto, CA",
        role: "Verified Client",
        rating: 5,
        text: "Understated elegance at its finest. No loud logos, just pure quality. This is exactly what the 'Quiet Luxury' movement should be about. Will definitely be returning for the spring collection.",
        product: "Minimalist Linen Trousers"
    }
];
