import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const pRes = await api.get('/farmer-profiles/me');
      if (pRes.data.success && pRes.data.data) {
        const farmerProfileId = pRes.data.data._id;
        const res = await api.get('/products');
        if (res.data.success) {
          const myProds = res.data.data.filter((p) => p.farmer?._id === farmerProfileId);
          setProducts(myProds);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading your products...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Listed Products</h1>
        <Link to="/farmer/products/add" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded shadow text-sm">
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center border border-gray-200 text-gray-500">
          You haven't listed any products yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-semibold">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{p.name}</td>
                  <td className="p-4 text-gray-600">{p.category?.name}</td>
                  <td className="p-4 font-semibold text-emerald-700">₹{p.price} / {p.unit}</td>
                  <td className="p-4 text-gray-700">{p.quantityAvailable}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link to={`/farmer/products/${p._id}/edit`} className="text-emerald-600 hover:underline font-medium">Edit</Link>
                    <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:underline font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
