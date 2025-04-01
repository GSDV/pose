export interface ReviewDot {
    id: string;
    title: string;
    price: string;
    currency: string;
    imageUrl: string;
    url: string;
    xPercent: number;
    yPercent: number;
    color: string;
}

export interface Dot {
    id: string;
    title: string;
    price: string;
    currency: string;
    imageUrl: string;
    url: string;
    xPercent: number;
    yPercent: number;
    color: string;
    brand: string;
}



export interface RedactedUser {
    id: string;
    username: string;
    displayName: string;
    pfpKey: string;
    bio: string;
    followerCount: number;
    followingCount: number;
    verified: boolean;
}



export interface Post {
    id: string;
    author: RedactedUser;
    caption: string;
    image: string;
    dots: Dot[];
}