

interface Product {
    product_id: string;
    product_url_y: string;
    product_name_y: string;
    product_description_y: string;
    product_images_y: string[];
    keyword_score: number;
    combined_score: number;
    cross_encoder_score: number;
    product_price_y: number;
  }

interface Message {
    text:String
    products:Product[]
    createdAt: admin.firestore.Timestamp
    user:{
        _id:String
        name:String
        avatar:String
    }
}