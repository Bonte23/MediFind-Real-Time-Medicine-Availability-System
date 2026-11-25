import React, { useState } from "react";
import UpdateMedicineForm from "./UpdateMedicineForm";

const ManageInventory = () => {
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);

    // ===== Dummy Data (Replace with API calls) =====
    const basicInfoData = [
        { id: 1, name: "Paracetamol", brand: "ABC Pharma", category: "Pain Relief", form: "Tablet", dosage: "500mg" },
        { id: 2, name: "Amoxicillin", brand: "XYZ Pharma", category: "Antibiotic", form: "Capsule", dosage: "250mg" }
    ];

    const stockPricingData = [
        { id: 1, name: "Paracetamol", expiry: "2025-12-31", price: 5.0, quantity: 100 },
        { id: 2, name: "Amoxicillin", expiry: "2024-09-15", price: 10.5, quantity: 50 }
    ];

    const regulatoryStatusData = [
        { id: 1, name: "Paracetamol", prescription: "No", status: "In Stock" },
        { id: 2, name: "Amoxicillin", prescription: "Yes", status: "Low Stock" }
    ];

    // ===== Handlers =====
    const handleUpdate = (medicine) => {
        setSelectedMedicine(medicine);
        setIsUpdateOpen(true);
    };

    const handleDelete = (id, tableName) => {
        console.log(`Deleting from ${tableName} table: ID ${id}`);
        // TODO: Replace with API call to delete item from the correct table
    };

    return (
        <div className="bg-white shadow-md rounded-md p-6 mt-6">
        <h2 className="text-xl font-bold mb-6">Manage Inventory</h2>

        {/* ===================== Basic Medicine Info Table ===================== */}
        <div className="mb-10">
            <h3 className="font-semibold">Basic Medicine Info Table</h3>
            <p className="text-sm text-gray-500 mb-2">
            Displays general details about each medicine, including its name, brand, category, form, and dosage.
            </p>

            <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead className="bg-gray-50">
                <tr>
                    <th className="p-3 border border-gray-200"><input type="checkbox" /></th>
                    {["Medicine Name", "Brand", "Category", "Type/Form", "Dosage", "Actions"].map((col, idx) => (
                    <th key={idx} className="p-3 text-left border border-gray-200 font-semibold">{col}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {basicInfoData.length > 0 ? basicInfoData.map((med) => (
                    <tr key={med.id} className="hover:bg-gray-50">
                    <td className="p-3 border border-gray-200"><input type="checkbox" /></td>
                    <td className="p-3 border border-gray-200">{med.name}</td>
                    <td className="p-3 border border-gray-200">{med.brand}</td>
                    <td className="p-3 border border-gray-200">{med.category}</td>
                    <td className="p-3 border border-gray-200">{med.form}</td>
                    <td className="p-3 border border-gray-200">{med.dosage}</td>
                    <td className="p-3 border border-gray-200 flex space-x-2">
                        <button onClick={() => handleUpdate(med)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Update</button>
                        <button onClick={() => handleDelete(med.id, "Basic Info")} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                    </td>
                    </tr>
                )) : (
                    <tr>
                    <td colSpan={7} className="p-3 text-center text-gray-500">No data available</td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>

        {/* ===================== Stock & Pricing Table ===================== */}
        <div className="mb-10">
            <h3 className="font-semibold">Stock & Pricing Table</h3>
            <p className="text-sm text-gray-500 mb-2">
            Shows inventory-related data such as batch number, expiry date, quantity in stock, and unit price.
            </p>

            <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead className="bg-gray-50">
                <tr>
                    <th className="p-3 border border-gray-200"><input type="checkbox" /></th>
                    {["Medicine Name", "Expiry Date", "Price Per Unit", "Quantity In Stock", "Actions"].map((col, idx) => (
                    <th key={idx} className="p-3 text-left border border-gray-200 font-semibold">{col}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {stockPricingData.length > 0 ? stockPricingData.map((med) => (
                    <tr key={med.id} className="hover:bg-gray-50">
                    <td className="p-3 border border-gray-200"><input type="checkbox" /></td>
                    <td className="p-3 border border-gray-200">{med.name}</td>
                    <td className="p-3 border border-gray-200">{med.expiry}</td>
                    <td className="p-3 border border-gray-200">KSh {med.price.toFixed(2)}</td>
                    <td className="p-3 border border-gray-200">{med.quantity}</td>
                    <td className="p-3 border border-gray-200 flex space-x-2">
                        <button onClick={() => handleUpdate(med)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Update</button>
                        <button onClick={() => handleDelete(med.id, "Stock & Pricing")} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                    </td>
                    </tr>
                )) : (
                    <tr>
                    <td colSpan={6} className="p-3 text-center text-gray-500">No data available</td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>

        {/* ===================== Regulatory & Status Table ===================== */}
        <div className="mb-10">
            <h3 className="font-semibold">Regulatory & Status Table</h3>
            <p className="text-sm text-gray-500 mb-2">
            Contains information about prescription requirements and current stock availability status.
            </p>

            <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead className="bg-gray-50">
                <tr>
                    <th className="p-3 border border-gray-200"><input type="checkbox" /></th>
                    {["Medicine Name", "Prescription Required", "Status", "Actions"].map((col, idx) => (
                    <th key={idx} className="p-3 text-left border border-gray-200 font-semibold">{col}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {regulatoryStatusData.length > 0 ? regulatoryStatusData.map((med) => (
                    <tr key={med.id} className="hover:bg-gray-50">
                    <td className="p-3 border border-gray-200"><input type="checkbox" /></td>
                    <td className="p-3 border border-gray-200">{med.name}</td>
                    <td className="p-3 border border-gray-200">{med.prescription}</td>
                    <td className="p-3 border border-gray-200">{med.status}</td>
                    <td className="p-3 border border-gray-200 flex space-x-2">
                        <button onClick={() => handleUpdate(med)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Update</button>
                        <button onClick={() => handleDelete(med.id, "Regulatory & Status")} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                    </td>
                    </tr>
                )) : (
                    <tr>
                    <td colSpan={5} className="p-3 text-center text-gray-500">No data available</td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>

        {/* ===== Update Form ===== */}
        <UpdateMedicineForm
            isOpen={isUpdateOpen}
            onClose={() => setIsUpdateOpen(false)}
            medicine={selectedMedicine}
        />
        </div>
    );
};

export default ManageInventory;
