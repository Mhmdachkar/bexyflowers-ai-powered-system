export interface Bouquet {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  displayCategory?: string;
  featured?: boolean;
  is_out_of_stock?: boolean;
  discount_percentage?: number | null;
  flower_type?: 'eternal' | 'real' | 'mixed';
  collection_year?: number;
}
export interface Flower {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
  description?: string;
}

export interface SelectedFlower {
  flower: Flower;
  quantity: number;
  position?: {
    x: number;
    y: number;
    rotation?: number;
    scale?: number;
  };
}

export interface PreDesignedBouquet {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  flowers: Array<{
    flowerId: string;
    quantity: number;
    position?: {
      x: number;
      y: number;
      rotation?: number;
      scale?: number;
    };
  }>;
  totalPrice: number;
  category: string;
}

export interface BouquetState {
  selectedFlowers: Record<string, SelectedFlower>;
  totalPrice: number;
  canvasSize: {
    width: number;
    height: number;
  };
}

export interface BouquetBuilderProps {
  onOrder?: (bouquet: BouquetState) => void;
  initialBouquet?: Partial<BouquetState>;
}

export interface BouquetCanvasProps {
  selectedFlowers: Record<string, SelectedFlower>;
  canvasSize: {
    width: number;
    height: number;
  };
  onFlowerPositionChange?: (flowerId: string, position: SelectedFlower['position']) => void;
}

export interface FlowerSelectorProps {
  flowers: Flower[];
  onFlowerSelect: (flower: Flower) => void;
  selectedCount?: number;
}

export interface SummaryPanelProps {
  selectedFlowers: Record<string, SelectedFlower>;
  totalPrice: number;
  onQuantityChange: (flowerId: string, quantity: number) => void;
  onFlowerRemove: (flowerId: string) => void;
  onOrder: () => void;
  onClearAll: () => void;
}

export interface PreDesignedBouquetsProps {
  bouquets: PreDesignedBouquet[];
  onBouquetSelect: (bouquet: PreDesignedBouquet) => void;
}

