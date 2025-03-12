export type IUser ={
    id:string;
    email: string;
    name: string;
    image: string;
    isPublic:Boolean;
    followers:any[];
    following:any[];
    bio:string;
    requestCount:number;
    instagramId:string;
    createdAt:Date;
    updatedAt:Date;
    isPremium:boolean;
}