import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import axios from 'axios'
import { FaFilter, FaSearch, FaDownload, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaExclamationCircle, FaSpinner, FaHistory, FaExternalLinkAlt, FaFilePdf, FaFileExcel, FaFileCsv } from 'react-icons/fa'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

function Transactions() {
  const { userData, fetchDashboardData, stats } = useStore()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState('desc') // desc = newest first
  const [showExportMenu, setShowExportMenu] = useState(false)
  const transactionsPerPage = 10
  const exportMenuRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await fetchDashboardData()
        
        // Fetch all transactions directly from the API
        const response = await axios.get('/api/user/transactions');
        if (response.data.success) {
          setTransactions(response.data.transactions || []);
        } else {
          // Fallback to recentTransactions if the API call fails
          if (userData?.recentTransactions) {
            setTransactions(userData.recentTransactions);
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        // Fallback to recentTransactions if the API call fails
        if (userData?.recentTransactions) {
          setTransactions(userData.recentTransactions);
        }
        setError('Failed to load all transactions. Showing recent transactions only.');
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [fetchDashboardData, userData])

  // Preload dashboard data when hovering over the back button
  const handleBackHover = () => {
    // Preload dashboard data to make navigation faster
    fetchDashboardData()
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Apply type filter
    if (filter !== 'all' && transaction.type !== filter) return false
    
    // Apply search filter (search by amount, status, or payment method)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        transaction.amount.toString().includes(searchTerm) ||
        transaction.status.toLowerCase().includes(searchLower) ||
        (transaction.paymentMethod && transaction.paymentMethod.toLowerCase().includes(searchLower))
      )
    }
    
    return true
  })

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  // Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage
  const currentTransactions = sortedTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction)
  const totalPages = Math.ceil(sortedTransactions.length / transactionsPerPage)

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Get transaction status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  // Get transaction type class
  const getTypeClass = (type) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-500'
      case 'withdrawal':
        return 'bg-amber-500'
      case 'investment':
        return 'bg-purple-500'
      default:
        return 'bg-blue-500'
    }
  }

  // Export functions
  const exportToPDF = () => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Transaction History', 14, 22);
      
      // Add date
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add user info if available
      if (userData?.name) {
        doc.text(`User: ${userData.name}`, 14, 38);
      }
      
      // Define the columns
      const tableColumn = ["Date", "Type", "Amount", "Status", "Method"];
      
      // Define the rows
      const tableRows = [];
      
      // For each transaction, create a row
      sortedTransactions.forEach(transaction => {
        const date = new Date(transaction.createdAt).toLocaleDateString();
        const type = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
        const amount = `$${parseFloat(transaction.amount).toFixed(2)}`;
        const status = transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1);
        const method = transaction.paymentMethod || 'N/A';
        
        tableRows.push([date, type, amount, status, method]);
      });
      
      // Generate the table using the imported autoTable function
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 135, 245] }
      });
      
      // Save the PDF
      doc.save('transaction-history.pdf');
      toast.success('PDF exported successfully');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export PDF. Please try again.');
    }
  };
  
  const exportToExcel = () => {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new()
      
      // Format the data for Excel
      const excelData = sortedTransactions.map(transaction => ({
        Date: new Date(transaction.createdAt).toLocaleDateString(),
        Type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        Amount: `$${parseFloat(transaction.amount).toFixed(2)}`,
        Status: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1),
        Method: transaction.paymentMethod || 'N/A',
        ID: transaction.id || 'N/A'
      }))
      
      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')
      
      // Generate Excel file and save
      XLSX.writeFile(workbook, 'transaction-history.xlsx')
      toast.success('Excel file exported successfully')
      setShowExportMenu(false)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast.error('Failed to export Excel file. Please try again.')
    }
  }
  
  const exportToCSV = () => {
    try {
      // Format the data for CSV
      const csvData = sortedTransactions.map(transaction => ({
        Date: new Date(transaction.createdAt).toLocaleDateString(),
        Type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        Amount: `$${parseFloat(transaction.amount).toFixed(2)}`,
        Status: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1),
        Method: transaction.paymentMethod || 'N/A',
        ID: transaction.id || 'N/A'
      }))
      
      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(csvData)
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new()
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')
      
      // Generate CSV file and save
      XLSX.writeFile(workbook, 'transaction-history.csv', { bookType: 'csv' })
      toast.success('CSV file exported successfully')
      setShowExportMenu(false)
    } catch (error) {
      console.error('Error exporting to CSV:', error)
      toast.error('Failed to export CSV file. Please try again.')
    }
  }

  // Calculate transaction statistics - use stats from the store if available, otherwise calculate from transactions
  const totalDeposits = stats?.totalDeposits ? 
    parseFloat(stats.totalDeposits).toFixed(2) : 
    transactions
      .filter(t => t.type === 'deposit' && t.status === 'approved')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      .toFixed(2);

  const totalWithdrawals = stats?.totalWithdrawals ? 
    parseFloat(stats.totalWithdrawals).toFixed(2) : 
    transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'approved')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      .toFixed(2);

  const totalInvestments = stats?.totalInvestments ? 
    parseFloat(stats.totalInvestments).toFixed(2) : 
    transactions
      .filter(t => t.type === 'investment' && t.status === 'approved')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      .toFixed(2);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
    }
    
    // Add event listener when the menu is open
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
            <FaExclamationCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Transactions</h2>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Transaction History</h1>
            <p className="text-slate-400">View and manage all your transaction records</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center px-4 py-2.5 sm:px-5 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg shadow-md hover:shadow-indigo-900/30 transition-all duration-300 font-medium text-sm sm:text-base"
              >
                <FaDownload className="mr-2" />
                Export
              </button>
              
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10"
                >
                  <div className="py-1">
                    <button
                      onClick={exportToPDF}
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-slate-700"
                    >
                      <FaFilePdf className="mr-2 text-red-400" />
                      Export as PDF
                    </button>
                    <button
                      onClick={exportToExcel}
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-slate-700"
                    >
                      <FaFileExcel className="mr-2 text-green-400" />
                      Export as Excel
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-slate-700"
                    >
                      <FaFileCsv className="mr-2 text-blue-400" />
                      Export as CSV
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            
            <Link 
              to="/dashboard" 
              className="inline-flex items-center px-4 py-2.5 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium text-sm sm:text-base"
              onMouseEnter={handleBackHover}
            >
              <FaChevronLeft className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-5 rounded-xl border border-slate-700/50 shadow-lg"
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center text-green-400 mr-3">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-slate-300">Total Deposits</h3>
            </div>
            <p className="text-2xl font-bold text-white">${totalDeposits}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 p-5 rounded-xl border border-slate-700/50 shadow-lg"
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-900/50 flex items-center justify-center text-amber-400 mr-3">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-slate-300">Total Withdrawals</h3>
            </div>
            <p className="text-2xl font-bold text-white">${totalWithdrawals}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 p-5 rounded-xl border border-slate-700/50 shadow-lg"
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400 mr-3">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-slate-300">Total Investments</h3>
            </div>
            <p className="text-2xl font-bold text-white">${totalInvestments}</p>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-slate-800 to-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 border border-slate-700/50 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="filter" className="block text-sm font-medium text-gray-400 mb-1">Filter by Type</label>
              <div className="relative">
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Transactions</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="investment">Investments</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-400 mb-1">Sort by Date</label>
              <div className="relative">
                <select
                  id="sort"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">Search</label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Search by amount, status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-r from-slate-800 to-slate-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 shadow-xl mb-8"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white">Transactions</h2>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FaSpinner className="animate-spin h-10 w-10 text-blue-500 mb-4" />
              <p className="text-slate-400">Loading your transactions...</p>
            </div>
          ) : currentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700/50">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">Method</th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">Date</th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30 bg-slate-800/30">
                  {currentTransactions.map((transaction, idx) => (
                    <motion.tr 
                      key={transaction.id} 
                      variants={itemVariants}
                      className={`hover:bg-slate-700/30 transition-colors ${idx % 2 === 0 ? 'bg-slate-800/50' : ''}`}
                    >
                      <td className="px-6 py-4 capitalize whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${getTypeClass(transaction.type)}`}></span>
                          {transaction.type}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-medium">
                        ${parseFloat(transaction.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell whitespace-nowrap text-gray-300">
                        {transaction.paymentMethod || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(transaction.status)}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell whitespace-nowrap text-gray-300">
                        {new Date(transaction.createdAt).toLocaleDateString()} 
                        <span className="text-gray-500 ml-2 text-xs">
                          {new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {transaction.type === 'deposit' && transaction.proofImage ? (
                          <a 
                            href={`${axios.defaults.baseURL}/uploads/${transaction.proofImage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                          >
                            View Proof
                            <FaExternalLinkAlt className="w-3 h-3 ml-1" />
                          </a>
                        ) : transaction.type === 'investment' ? (
                          <span className="text-purple-400 font-medium">
                            {transaction.dailyProfitRate}% Daily
                          </span>
                        ) : transaction.type === 'withdrawal' ? (
                          <span className="text-gray-400" title={transaction.walletAddress}>
                            {transaction.walletAddress ? 
                              `${transaction.walletAddress.substring(0, 10)}...` : 
                              'N/A'}
                          </span>
                        ) : 'N/A'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50 mb-4">
                <FaHistory className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-gray-400 text-lg mb-2">No transactions found</p>
              <p className="text-gray-500 max-w-md mx-auto">
                {filter !== 'all' 
                  ? `No ${filter} transactions found. Try changing your filters.` 
                  : searchTerm 
                    ? 'No transactions match your search criteria.' 
                    : 'Start your investment journey by making your first deposit or investment.'}
              </p>
              {filter === 'all' && !searchTerm && (
                <Link to="/deposit" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Make a Deposit
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </Link>
              )}
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-700/50">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{indexOfFirstTransaction + 1}</span> to{' '}
                <span className="font-medium text-white">
                  {Math.min(indexOfLastTransaction, sortedTransactions.length)}
                </span>{' '}
                of <span className="font-medium text-white">{sortedTransactions.length}</span> transactions
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  // Show limited page numbers with ellipsis
                  if (
                    i === 0 || // First page
                    i === totalPages - 1 || // Last page
                    (i >= currentPage - 2 && i <= currentPage) || // 2 pages before current
                    (i <= currentPage + 1 && i >= currentPage) // 1 page after current
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  }
                  
                  // Show ellipsis
                  if (
                    (i === 1 && currentPage > 3) || // Show ellipsis after first page
                    (i === totalPages - 2 && currentPage < totalPages - 2) // Show ellipsis before last page
                  ) {
                    return <span key={i} className="px-3 py-1 text-gray-400">...</span>
                  }
                  
                  return null
                })}
                
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      <Footer />
    </div>
  )
}

export default Transactions 