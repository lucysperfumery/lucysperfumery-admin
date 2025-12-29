import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import orderService from "@/services/orderService";
import type { Order } from "@/types/order";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (
    orderId: string,
    status: "pending" | "completed" | "failed"
  ) => {
    try {
      await orderService.updateStatus(orderId, status);
      toast.success("Order status updated");
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        const updated = await orderService.getById(orderId);
        setSelectedOrder(updated);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o._id.includes(searchQuery)
  );

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Orders</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            placeholder="Search by customer, email, or order ID..."
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
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg p-4 space-y-3 bg-white dark:bg-neutral-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                        {order.orderNumber}
                      </p>
                      <p className="font-semibold">{order.customer.name}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {order.customer.email}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Total
                      </p>
                      <p className="font-semibold text-lg">
                        {order.currency}
                        {order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Date
                      </p>
                      <p className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewOrder(order)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Email
                    </TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-xs">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.customer.name}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {order.customer.email}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {order.currency}
                        {order.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedOrder.customer.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedOrder.customer.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedOrder.customer.phone}
                  </p>
                  {selectedOrder.metadata?.deliveryAddress && (
                    <>
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {selectedOrder.metadata.deliveryAddress}
                      </p>
                      {selectedOrder.metadata.country && (
                        <p>
                          <span className="font-medium">Country:</span>{" "}
                          {selectedOrder.metadata.country}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {selectedOrder.currency}
                            {item.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {selectedOrder.currency}
                            {(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">
                          Total:
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {selectedOrder.currency}
                          {selectedOrder.totalAmount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* <div>
                <h3 className="font-semibold mb-2">Update Status</h3>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleUpdateStatus(selectedOrder._id, value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              <div className="text-xs text-neutral-500 space-y-1">
                <p>Payment Ref: {selectedOrder.paystackReference}</p>
                <p>
                  Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
