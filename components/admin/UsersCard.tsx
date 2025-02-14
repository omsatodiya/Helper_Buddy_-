'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Coins, MoreVertical, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { columnStyles } from '@/components/shared/TableLayout';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  coins: number;
  role: string;
  createdAt: string;
}

interface UsersCardProps {
  currentPage: number;
  itemsPerPage: number;
  onTotalUsersChange?: (total: number) => void;
  onDataLoad?: () => void;
}

export function UsersCard({ currentPage, itemsPerPage, onTotalUsersChange, onDataLoad }: UsersCardProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const db = getFirestore();
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ 
        id: doc.id,
        ...doc.data() 
      } as UserData));
      
      // Sort users by creation date
      const sortedUsers = usersData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setUsers(sortedUsers);
      onTotalUsersChange?.(sortedUsers.length);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      onDataLoad?.();
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'users', editingUser.id), {
        role: editingUser.role,
        coins: Number(editingUser.coins),
      });
      
      await fetchUsers();
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!editingUser) return;
    
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'users', editingUser.id));
      
      await fetchUsers();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Get paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full border border-black/10 dark:border-white/10">
      <CardHeader className="p-4 border-b border-black/10 dark:border-white/10">
        <CardTitle className="text-black dark:text-white">All Users</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full table-fixed text-sm text-black dark:text-white">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <th className={columnStyles.name}>Name</th>
                <th className={columnStyles.email}>Email</th>
                <th className={columnStyles.role}>Role</th>
                <th className={columnStyles.coins}>Coins</th>
                <th className={columnStyles.actions}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.firstName} {user.lastName}</span>
                      <span className="text-xs text-black/60 dark:text-white/60">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 truncate text-black/60 dark:text-white/60">
                    {user.email}
                  </td>
                  <td className="p-4">
                    <div className="flex items-start gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium inline-block",
                        user.role === 'admin' 
                          ? "bg-black text-white dark:bg-white dark:text-black" 
                          : "bg-black/10 dark:bg-white/10"
                      )}>
                        {user.role === 'provider' ? 'provider' : user.role}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-start gap-2">
                      <Coins className="h-4 w-4" />
                      <span>{user.coins.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-black/60 dark:text-white/60"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingUser(user);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400"
                            onClick={() => {
                              setEditingUser(user);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user role and coins
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => 
                    setEditingUser(prev => prev ? {...prev, role: value} : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Coins</Label>
                <Input
                  type="number"
                  value={editingUser.coins}
                  onChange={(e) => 
                    setEditingUser(prev => prev ? {...prev, coins: Number(e.target.value)} : null)
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 