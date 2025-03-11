export type IUser ={
    email: string;
    name: string;
    image: string;
    isPublic:Boolean;
    followers:any[];
    following:any[];
    bio:string;
    requestCount:number;
    createdAt:Date;
    updatedAt:Date;
    isPremium:boolean;
}