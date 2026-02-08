'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User as UserType } from '@/lib/appwrite/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
  hasAccess: boolean;
  purchaseDate?: string | null;
  isEarlyAccess?: boolean; // Indicates if user purchased early access
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    async function init() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user) {
        loadUsers(user.userId);
      }
    }
    init();
  }, []);

  async function loadUsers(userId: string) {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((user) =>
    filter
      ? user.email.toLowerCase().includes(filter.toLowerCase()) ||
        user.name.toLowerCase().includes(filter.toLowerCase())
      : true
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Users</h1>
        <p className="text-muted-foreground">Manage user accounts and access</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <Input
              placeholder="Search users..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground text-center py-8">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              No users found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.hasAccess ? 'default' : 'outline'}>
                        {user.hasAccess ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isEarlyAccess ? (
                        <Badge variant="default" className="bg-primary">
                          Early Access
                        </Badge>
                      ) : user.hasAccess ? (
                        <Badge variant="outline">Regular</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.purchaseDate
                        ? new Date(user.purchaseDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
