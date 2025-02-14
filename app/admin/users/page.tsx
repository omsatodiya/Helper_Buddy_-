"use client";

import { UsersCard } from "@/components/admin/UsersCard";
import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  return (
    <div className="space-y-4">
      <UsersCard 
        currentPage={currentPage} 
        itemsPerPage={ITEMS_PER_PAGE} 
        onTotalUsersChange={setTotalUsers}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(totalUsers / ITEMS_PER_PAGE))}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 