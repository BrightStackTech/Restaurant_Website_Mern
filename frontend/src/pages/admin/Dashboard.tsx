import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUsers, FaUtensils, FaComments, FaMedal } from "react-icons/fa";
import { getAdminStats } from "../../api/admin.service";
import TopProductCard from '../../components/TopProductCard'; 
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getUserGrowthStats } from '../../api/admin.service';
import { useNavigate } from "react-router-dom";

interface StatsState {
  totalUsers: number;
  totalProducts: number;
  totalReviews: number;
  topProducts: any[];
  topReviews: any[];
}

const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

const Dashboard = () => {
  const [growthData, setGrowthData] = useState<{ _id: string, count: number }[]>([]);
  const [growthPeriod, setGrowthPeriod] = useState<'hour' | 'day' | 'month' | 'year'>('day');
  const [growthLoading, setGrowthLoading] = useState(false);
  const [stats, setStats] = useState<StatsState>({
    totalUsers: 0,
    totalProducts: 0,
    totalReviews: 0,
    topProducts: [],
    topReviews: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatXAxis = (tick: string | number) => {
    if (growthPeriod === 'month' && typeof tick === 'string' && tick.includes('-')) {
      const [year, month] = tick.split('-');
      return monthNames[parseInt(month, 10)] + ' ' + year;
    }
    if (growthPeriod === 'hour') {
      // If tick is a number (e.g., 0-23), format as "01:00", "13:00", etc.
      const hour = typeof tick === 'number' ? tick : parseInt(tick, 10);
      return `${hour.toString().padStart(2, '0')}:00`;
    }
    if (growthPeriod === 'year' && typeof tick === 'number') {
      return tick.toString();
    }
    return tick?.toString?.() ?? '';
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getAdminStats();
        if (response.success && response.data) {
          setStats({
            totalUsers: response.data.totalUsers,
            totalProducts: response.data.totalProducts,
            totalReviews: response.data.totalReviews,
            topProducts: response.data.topProducts || [],
            topReviews: response.data.topReviews || [],
          });
        }
      } catch (error) {
        // Optionally show toast error
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchGrowth = async () => {
      setGrowthLoading(true);
      try {
        const res = await getUserGrowthStats(growthPeriod);
        if (res.success && res.data) setGrowthData(res.data);
      } catch (e) {}
      setGrowthLoading(false);
    };
    fetchGrowth();
  }, [growthPeriod]);

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Admin Dashboard</h1>
          <div>
            <Link
              to="/"
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition"
            >
              My Site
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                <FaUsers className="text-blue-500 dark:text-blue-300 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-semibold dark:text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
                <FaUtensils className="text-green-500 dark:text-green-300 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Products</p>
                <p className="text-2xl font-semibold dark:text-white">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
                <FaComments className="text-purple-500 dark:text-purple-300 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Reviews</p>
                <p className="text-2xl font-semibold dark:text-white">{stats.totalReviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin/users"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center"
          >
            <FaUsers className="text-primary-600 text-2xl mr-4" />
            <div>
              <h3 className="font-bold dark:text-white">Manage Users</h3>
              <p className="text-gray-600 dark:text-gray-400">View and manage user accounts</p>
            </div>
          </Link>
          <Link
            to="/admin/products"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center"
          >
            <FaUtensils className="text-primary-600 text-2xl mr-4" />
            <div>
              <h3 className="font-bold dark:text-white">Manage Products</h3>
              <p className="text-gray-600 dark:text-gray-400">Add, edit or remove menu items</p>
            </div>
          </Link>
          <Link
            to="/admin/reviews"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition flex items-center"
          >
            <FaComments className="text-primary-600 text-2xl mr-4" />
            <div>
              <h3 className="font-bold dark:text-white">Manage Reviews</h3>
              <p className="text-gray-600 dark:text-gray-400">Moderate customer reviews</p>
            </div>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          {stats.topProducts.length > 0 ? (
            <TopProductCard product={stats.topProducts[0]} />
          ) : (
            <div className="text-gray-400 text-center py-12">No top product found.</div>
          )}
        </div>

        {/* Top Rated 3 Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Top Rated Products</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Number of Raters</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Number of Reviews</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">Loading...</td>
                </tr>
              ) : stats.topProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">No data</td>
                </tr>
              ) : (
                stats.topProducts.map((product, idx) => (
                  <tr key={product._id}>
                    <td className="px-2 py-2">
                      <FaMedal color={medalColors[idx]} title={["Gold", "Silver", "Bronze"][idx]} size={22} />
                    </td>
                    <td className="px-4 py-2 font-semibold underline" onClick={()=>navigate(`/menu/${product._id}`)}>{product.name}</td>
                    <td className="px-4 py-2">{product.ratingvalue?.toFixed(1)}</td>
                    <td className="px-4 py-2">{product.numRaters ?? 0}</td>
                    <td className="px-4 py-2">{product.numReviews ?? 0}</td>
                    <td className="px-4 py-2">₹{product.price?.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>

        {/* Most Liked 3 Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Most Liked Reviews</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Likes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-400">Loading...</td>
                  </tr>
                ) : stats.topReviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-400">No data</td>
                  </tr>
                ) : (
                  stats.topReviews.map((review, idx) => (
                    <tr key={review._id || idx}>
                      <td className="px-2 py-2">
                        <FaMedal color={medalColors[idx]} title={["Gold", "Silver", "Bronze"][idx]} size={22} />
                      </td>
                      <td className="px-4 py-2 flex items-center">
                        <span className="break-all whitespace-pre-line max-w-[120px]">
                          {(review.user?.name || "User").replace(/(.{10})/g, "$1\u200B")}
                        </span>
                      </td>
                      <td className="px-4 py-2 underline" onClick={()=>navigate(`/menu/${review.product._id}`)}>{typeof review.product === "object" && review.product !== null ? review.product.name : review.product}</td>
                      <td className="px-4 py-2">{review.likeCount ?? 0}</td>
                      <td className="px-4 py-2 break-all whitespace-pre-line max-w-[120px]">
                        {new Date(review.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-4 py-2 break-all whitespace-pre-line max-w-6xl">{review.content}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">Platform Growth</h2>
            <select
              title="Select Growth Period"
              value={growthPeriod}
              onChange={e => setGrowthPeriod(e.target.value as any)}
              className="border border-gray-300 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
            >
              <option value="hour">Past 24 Hours</option>
              <option value="day">Days</option>
              <option value="month">Months</option>
              <option value="year">Years</option>
            </select>
          </div>
          <div className="w-full overflow-x-auto">
            <div style={{
              width:
                growthPeriod === 'hour' ? 1200 :
                growthPeriod === 'day' ? 1200 :
                growthPeriod === 'month' ? 900 :
                growthPeriod === 'year' ? 600 : '100%',
              height: 300
            }}>
              {growthLoading ? (
                <div className="flex items-center justify-center h-full">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={growthData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" tickFormatter={formatXAxis} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#FF785B"
                      strokeWidth={3}
                      dot={{ r: 4, stroke: '#FF785B', strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;