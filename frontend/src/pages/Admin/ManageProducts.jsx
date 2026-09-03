import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminProducts();
  }, []);

  const fetchAdminProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      if (res.data.success) setProducts(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading products...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage System Products</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-semibold">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Farmer / Farm</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">{p.name}</td>
                <td className="p-4 text-gray-600">{p.category?.name}</td>
                <td className="p-4 text-gray-700">{p.farmer?.farmName}</td>
                <td className="p-4 font-semibold text-emerald-700">₹{p.price} / {p.unit}</td>
                <td className="p-4 font-bold">{p.quantityAvailable}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProducts;
