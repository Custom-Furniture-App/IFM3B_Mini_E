// models.ts
export type Role = "admin" | "manager" | "clerk" | "customer";


export interface Compatibility {
  id: string;
  component_id: string;
  compatible_with_id: string;
  allowed: boolean;
  note?: string;
}

export interface CustomProduct {
  id: string;
  name?: string;
  description?: string;
  customer_id?: string;
  components: { component_id: string; quantity: number }[];
}


// Nested interface for the items in the CompatibleComponents array
export interface CompatibleComponent {
  Id: number;
  Name: string;
}

export interface Component {
  Id: number;
  Name: string;
  Type: string;
  UnitPrice: number;
  Stock: number;
  ImageUrl: string;
  Category: string;
  Description: string;
  CompatibleComponents: CompatibleComponent[]; 
}



export interface Product {
  Id?: string;  
  ProductName: string;  
  Description?: string; 
  Category: string;   
  Price: number;  
  Stock: number;  
  ImageUrl?: string;  
  IsActive?: boolean;   
  CreatedDate: string;  
  UpdatedDate?: string;   
}


export interface User {
  Id: number;
  FullName: string;
  Email: string;
  Phone: string;
  Address: string | null; // changed {} → string | null (since Address should be text or null)
  Role: "Admin" | "Customer" | "Clerk" | string; // for flexibility
  CreatedAt: string; // ISO date string
  Disabled: boolean;
  IsDeleted: boolean;
}


// model.ts (or ordersModel.ts)

/**
 * Defines the structure for a single item (component) within an order.
 */
export interface OrderItem {
  OrderId: number;
  OrderItemId: number;
  ItemId: number;
  Quantity: number;
  UnitPrice: number;
  ItemType: string;
  Subtotal: number;
  ItemName: string;
  ItemCategory: string;
  ImageUrl: string;
}

// ----------------------------------------------------------------------

/**
 * Defines the structure for the main Order object with specific status types.
 */
export interface Order {
  Id: number;
  OrderNumber: string;
  CustomerId: number;
  CustomerName: string;
  Email: string;
  Phone: string;
  Address: string | null;
  FulfillmentType: "delivery" | "collection";

  /**
   * Status must be one of the defined string literals.
   */
  Status:
    | "assembling"
    | "done-assembling"
    | "ready-for-delivery"
    | "courier-on-the-way"
    | "ready-for-collection"
    | "completed";

  TotalAmount: number;
  CreatedAt: string; // ISO 8601 date string
  UpdatedAt: string | null;
  CompletedAt: string | null;
  Items: OrderItem[];
}


export interface UserRq {
  Id: number;
  FullName: string;
  Email: string;
  Phone: string;
  Address: string | null;
  Role: "Customer" | "Admin" | string;
  CreatedAt: string;
  Disabled: boolean;
  IsDeleted: boolean;
}
