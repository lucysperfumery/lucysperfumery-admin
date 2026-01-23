import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Search, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import productService from "@/services/productService";
import type { Product, ProductFormData, ProductOption } from "@/types/product";
import { categories } from "@/lib/consts";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [hasOptions, setHasOptions] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    stock: 0,
    options: [],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      const productHasOptions = !!(
        product.options && product.options.length > 0
      );
      setHasOptions(productHasOptions);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        stock: product.stock,
        options: product.options || [],
      });
      setImagePreview(product.image);
    } else {
      setEditingProduct(null);
      setHasOptions(false);
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "",
        image: "",
        stock: 0,
        options: [],
      });
      setImagePreview("");
    }
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [
        ...(formData.options || []),
        { name: "", price: 0, stock: 0, sku: "", isActive: true },
      ],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(formData.options || [])];
    newOptions.splice(index, 1);
    setFormData({ ...formData, options: newOptions });
  };

  const updateOption = (
    index: number,
    field: keyof ProductOption,
    value: string | number | boolean,
  ) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const toggleHasOptions = (enabled: boolean) => {
    setHasOptions(enabled);
    if (!enabled) {
      setFormData({ ...formData, options: [] });
    } else if (!formData.options || formData.options.length === 0) {
      addOption();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large", {
          description: "Maximum file size is 5MB",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate options if enabled
    if (hasOptions) {
      if (!formData.options || formData.options.length === 0) {
        toast.error("Please add at least one option");
        return;
      }

      for (const option of formData.options) {
        if (!option.name || !option.name.trim()) {
          toast.error("All options must have a name");
          return;
        }
        if (!option.price || option.price <= 0) {
          toast.error("All options must have a price greater than 0");
          return;
        }
        if (option.stock === undefined || option.stock < 0) {
          toast.error("All options must have a valid stock quantity");
          return;
        }
      }
    }

    try {
      setLoading(true);

      if (editingProduct) {
        await productService.update(
          editingProduct._id,
          formData,
          imageFile || undefined,
        );
        toast.success("Product updated successfully");
      } else {
        await productService.create(formData, imageFile || undefined);
        toast.success("Product created successfully");
      }
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await productService.toggleActive(id, !currentStatus);
      toast.success(currentStatus ? "Product deactivated" : "Product activated");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to update product status");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredProducts?.map((product) => (
                <div
                  key={product._id}
                  className="border rounded-lg p-4 space-y-3 bg-white dark:bg-neutral-900"
                >
                  <div className="flex gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        {product.category}
                      </p>
                      {(product.hasOptions ||
                        (product.options && product.options.length > 0)) && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {product.options?.length} Options
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Price
                      </p>
                      <p className="font-semibold text-lg">
                        {product.hasOptions ||
                        (product.options && product.options.length > 0) ? (
                          <span className="text-sm text-neutral-500">
                            Varied
                          </span>
                        ) : (
                          `GH₵${product.price.toFixed(2)}`
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Stock
                      </p>
                      <Badge
                        variant={
                          (product.hasOptions ||
                          (product.options && product.options.length > 0)
                            ? product.options?.reduce(
                                (sum, opt) => sum + opt.stock,
                                0,
                              ) || 0
                            : product.stock) > 5
                            ? "default"
                            : "destructive"
                        }
                      >
                        {product.hasOptions ||
                        (product.options && product.options.length > 0)
                          ? product.options?.reduce(
                              (sum, opt) => sum + opt.stock,
                              0,
                            ) || 0
                          : product.stock}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenDialog(product)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant={product.isActive ? "outline" : "default"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleToggleActive(product._id, product.isActive)}
                    >
                      {product.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2 text-gray-500" />
                          Inactive
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Category
                    </TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Options
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts?.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {product.category}
                      </TableCell>
                      <TableCell>
                        {product.hasOptions ||
                        (product.options && product.options.length > 0) ? (
                          <span className="text-sm text-neutral-500">
                            Varied
                          </span>
                        ) : (
                          `GH₵${product.price.toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.stock > 5 ? "default" : "destructive"
                          }
                        >
                          {product.hasOptions ||
                          (product.options && product.options.length > 0)
                            ? product.options?.reduce(
                                (sum, opt) => sum + opt.stock,
                                0,
                              ) || 0
                            : product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {product.hasOptions ||
                        (product.options && product.options.length > 0) ? (
                          <Badge variant="secondary">
                            {product.options?.length} Options
                          </Badge>
                        ) : (
                          <span className="text-sm text-neutral-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleActive(product._id, product.isActive)
                            }
                            title={product.isActive ? "Deactivate product" : "Activate product"}
                          >
                            {product.isActive ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              Fill in the product details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full"
                  required
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .sort((a, b) => a.localeCompare(b))
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Price/Stock - only show if no options */}
              {!hasOptions && (
                <>
                  {/* Price */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="price">Price (GH₵)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                  </div>

                  {/* Stock */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {/* Product Options Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="hasOptions"
                    className="text-base font-semibold"
                  >
                    Product Options
                  </Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Add variants like sizes, volumes, or colors with individual
                    pricing
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasOptions"
                    checked={hasOptions}
                    onChange={(e) => toggleHasOptions(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300"
                  />
                  <Label htmlFor="hasOptions" className="cursor-pointer">
                    Enable options
                  </Label>
                </div>
              </div>

              {hasOptions && (
                <div className="space-y-3">
                  {(formData.options || []).map((option, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3 bg-neutral-50 dark:bg-neutral-900"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Option {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`option-name-${index}`}>
                            Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id={`option-name-${index}`}
                            placeholder="e.g., 50ml, Large"
                            value={option.name}
                            onChange={(e) =>
                              updateOption(index, "name", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`option-price-${index}`}>
                            Price (GH₵){" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id={`option-price-${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={option.price}
                            onChange={(e) =>
                              updateOption(
                                index,
                                "price",
                                parseFloat(e.target.value),
                              )
                            }
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`option-stock-${index}`}>
                            Stock <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id={`option-stock-${index}`}
                            type="number"
                            min="0"
                            placeholder="0"
                            value={option.stock}
                            onChange={(e) =>
                              updateOption(
                                index,
                                "stock",
                                parseInt(e.target.value),
                              )
                            }
                            required
                          />
                        </div>
                      </div>

                      {/* <div className="flex flex-col gap-2">
                        <Label htmlFor={`option-sku-${index}`}>SKU (Optional)</Label>
                        <Input
                          id={`option-sku-${index}`}
                          placeholder="e.g., PERF-50ML"
                          value={option.sku || ""}
                          onChange={(e) => updateOption(index, "sku", e.target.value)}
                        />
                      </div> */}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              )}
            </div>

            {/* Product Image */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="image">Product Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-neutral-50 dark:bg-neutral-800">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingProduct ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
