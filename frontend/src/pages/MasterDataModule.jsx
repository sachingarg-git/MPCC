import React, { useState, useCallback, useEffect } from 'react';
import '../styles/MasterDataModule.css';
import ServicePlanForm from '../components/ServicePlanForm';

const MasterDataModule = () => {
  const [activeSubModule, setActiveSubModule] = useState('routes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [kitItems, setKitItems] = useState([{ id: 1, item: '', hsn: '', qty: 1, unit: 'Pcs', rate: 0 }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // Data states
  const [routes, setRoutes] = useState([]);
  const [servicePlans, setServicePlans] = useState([]);
  const [paymentFreqs, setPaymentFreqs] = useState([]);
  const [kits, setKits] = useState([]);
  const [wasteCategories, setWasteCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);

  // Sub-category rows for the Category Master add/edit form
  const [subCategoryItems, setSubCategoryItems] = useState([{ id: 1, name: '' }]);
  const [planItems, setPlanItems] = useState([]);

  // Submenu items
  const subMenuItems = [
    { id: 'zones', icon: '🗺️', label: 'Zone Master' },
    { id: 'routes', icon: '🛣️', label: 'Route Master' },
    { id: 'serviceplans', icon: '📋', label: 'Service Plan Master' },
    { id: 'paymentfreqs', icon: '💳', label: 'Payment Frequency' },
    { id: 'kits', icon: '🧰', label: 'Kit Master' },
    { id: 'wastecategories', icon: '🗑️', label: 'Waste Category' },
    { id: 'vehicles', icon: '🚗', label: 'Vehicle Master' },
    { id: 'vendors', icon: '🏪', label: 'Vendor Master' },
    { id: 'rawmaterials', icon: '🧪', label: 'Raw Materials / Items' },
    { id: 'categorymaster', icon: '🏷️', label: 'Category Master' }
  ];

  // Content configuration
  const getSubModuleContent = () => {
    const configs = {
      'routes': {
        title: 'Route Master',
        description: 'Manage collection routes and driver assignments',
        icon: '🛣️',
        infoText: 'Create and manage biomedical waste collection routes. Assign drivers, set collection schedules, and track route efficiency. Each route can have primary and secondary drivers.',
        stats: [
          { label: 'Total Routes', value: routes.length, className: '' },
          { label: 'Active', value: routes.filter(r => r.IsActive === 1 || r.IsActive === true).length, className: 'creg-green' },
          { label: 'Inactive', value: routes.filter(r => !r.IsActive).length, className: 'creg-red' }
        ],
        columns: ['Code', 'Name', 'Type', 'Primary Driver', 'Secondary Driver', 'Status', 'Actions'],
        data: routes
      },
      'serviceplans': {
        title: 'Service Plan Master',
        description: 'Configure service plans with pricing and collection details',
        icon: '📋',
        infoText: 'Define biomedical waste management service plans with categories, zones, pricing, and features. Configure monthly charges, registration fees, and consulting charges.',
        stats: [
          { label: 'Total Plans', value: servicePlans.length, className: '' },
          { label: 'Active', value: servicePlans.filter(p => p.status === 'Active').length, className: 'creg-green' },
          { label: 'Inactive', value: servicePlans.filter(p => p.status !== 'Active').length, className: 'creg-red' }
        ],
        columns: ['Code', 'Name', 'Category', 'Facility Types', 'Monthly Rate', 'Status', 'Actions'],
        data: servicePlans
      },
      'paymentfreqs': {
        title: 'Payment Frequency',
        description: 'Define payment frequency options and discount structures',
        icon: '💳',
        infoText: 'Configure payment frequency options (Monthly, Quarterly, etc.) with discount percentages and conditions. Manage billing cycles and payment grace periods.',
        stats: [
          { label: 'Total Frequencies', value: paymentFreqs.length, className: '' },
          { label: 'With Discounts', value: paymentFreqs.filter(f => f.discountPct > 0 || f.discountAmt > 0).length, className: 'creg-green' }
        ],
        columns: ['Name', 'Months', 'Discount Amt', 'Discount %', 'Status', 'Actions'],
        data: paymentFreqs
      },
      'kits': {
        title: 'Kit Master',
        description: 'Manage waste collection kit configurations and pricing',
        icon: '🧰',
        infoText: 'Configure biomedical waste collection kits with items, quantities, and pricing. Track kit inventory and manage kit-to-customer assignments.',
        stats: [
          { label: 'Total Kits', value: kits.length, className: '' },
          { label: 'Active', value: kits.filter(k => k.IsActive === 1 || k.IsActive === true).length, className: 'creg-green' }
        ],
        columns: ['Code', 'Name', 'Type', 'Selling Price', 'Status', 'Actions'],
        data: kits
      },
      'wastecategories': {
        title: 'Waste Category',
        description: 'Define waste categories and classification rules',
        icon: '🗑️',
        infoText: 'Manage biomedical waste categories (Yellow, Red, Green, Black) with classification rules, handling procedures, and regulatory requirements.',
        stats: [
          { label: 'Total Categories', value: wasteCategories.length, className: '' },
          { label: 'High Hazard', value: wasteCategories.filter(w => w.hazardLevel === 'High' || w.hazardLevel === 'Extreme').length, className: 'creg-red' }
        ],
        columns: ['Code', 'Name', 'Color', 'Hazard Level', 'Storage Days', 'Actions'],
        data: wasteCategories
      },
      'vehicles': {
        title: 'Vehicle Master',
        description: 'Manage collection vehicles and maintenance schedules',
        icon: '🚗',
        infoText: 'Track biomedical waste collection vehicles, maintenance schedules, registration details, and compliance certifications. Monitor vehicle health and assign to routes.',
        stats: [
          { label: 'Total Vehicles', value: vehicles.length, className: '' },
          { label: 'Active', value: vehicles.filter(v => v.status === 'Active').length, className: 'creg-green' }
        ],
        columns: ['Code', 'Registration No', 'Category', 'Manufacturer', 'Fuel Type', 'Status', 'Actions'],
        data: vehicles
      },
      'vendors': {
        title: 'Vendor Master',
        description: 'Manage suppliers and service vendors',
        icon: '🏪',
        infoText: 'Maintain vendor database for kits, equipment, and services. Track vendor contact info, pricing, delivery schedules, and payment terms.',
        stats: [
          { label: 'Total Vendors', value: vendors.length, className: '' },
          { label: 'Active', value: vendors.filter(v => v.status === 'Active').length, className: 'creg-green' }
        ],
        columns: ['Code', 'Name', 'Type', 'Contact Person', 'Email', 'Status', 'Actions'],
        data: vendors
      },
      'rawmaterials': {
        title: 'Raw Materials / Items',
        description: 'Manage inventory items and raw materials',
        icon: '🧪',
        infoText: 'Track raw materials, consumables, and spare parts inventory. Manage stock levels, reorder points, and supplier information.',
        stats: [
          { label: 'Total Items', value: rawMaterials.length, className: '' }
        ],
        columns: ['Code', 'Name', 'Type', 'HSN', 'Status', 'Actions'],
        data: rawMaterials
      },
      'zones': {
        title: 'Zone Master',
        description: 'Manage service zones and operational areas',
        icon: '🗺️',
        infoText: 'Create and manage service zones (cities, areas, regions). Zones are used in Service Plan Master to assign pricing zones and on the customer registration form.',
        stats: [
          { label: 'Total Zones', value: zones.length, className: '' },
          { label: 'Active', value: zones.filter(z => z.IsActive === 1 || z.IsActive === true).length, className: 'creg-green' },
          { label: 'Inactive', value: zones.filter(z => !z.IsActive).length, className: 'creg-red' }
        ],
        columns: ['Code', 'Zone Name', 'Type', 'Status', 'Actions'],
        data: zones
      },
      'categorymaster': {
        title: 'Category Master',
        description: 'Manage service categories and their sub-categories',
        icon: '🏷️',
        infoText: 'Define service plan categories (e.g. Biomedical Waste, General Waste) and their sub-categories. These feed the Category and Sub-Category dropdowns in Service Plan Master.',
        stats: [
          { label: 'Total Categories', value: categories.length, className: '' },
          { label: 'Active', value: categories.filter(c => c.IsActive).length, className: 'creg-green' },
          { label: 'Sub-Categories', value: categories.reduce((n, c) => n + (c.SubCategories ? c.SubCategories.length : 0), 0), className: '' }
        ],
        columns: ['#', 'Category Name', 'Sub-Categories', 'Status', 'Actions'],
        data: categories
      }
    };
    return configs[activeSubModule] || configs['routes'];
  };

  // Transform API data to match column names
  const transformDataForDisplay = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      id: item.id || item.RouteID || item.PlanID || item.FrequencyID || item.KitID || item.CategoryID || item.VehicleID || item.VendorID || item.MaterialID,
      code: item.code || item.RouteCode || item.PlanCode || item.FrequencyCode || item.KitCode || item.CategoryCode || item.VehicleCode || item.VendorCode || item.MaterialCode,
      'Code': item.code || item.RouteCode || item.PlanCode || item.FrequencyCode || item.KitCode || item.CategoryCode || item.VehicleCode || item.VendorCode || item.MaterialCode,
      name: item.name || item.RouteName || item.PlanName || item.FrequencyName || item.KitName || item.CategoryName || item.VehicleName || item.MaterialName,
      'Name': item.name || item.RouteName || item.PlanName || item.FrequencyName || item.KitName || item.CategoryName || item.VehicleName || item.MaterialName,
      type: item.type || item.RouteType || item.VehicleCategory,
      'Type': item.type || item.RouteType || item.VehicleCategory,
      category: item.category,
      'Category': item.category,
      zone: item.zone,
      'Zone': item.zone,
      'Monthly Rate': item.monthlyCharges || item.monthlyRate,
      status: item.status || (item.IsActive || item.isActive ? 'Active' : 'Inactive'),
      'Status': item.status || (item.IsActive || item.isActive ? 'Active' : 'Inactive'),
      'Primary Driver': item.primaryDriver,
      'Secondary Driver': item.secondaryDriver,
      color: item.color || item.bagColor,
      'Color': item.color || item.bagColor,
      'Hazard Level': item.hazardLevel,
      'Storage Days': item.maxStorageDays,
      'Registration No': item.registrationNo,
      ...item
    }));
  };

  const getCurrentData = () => {
    const dataMap = {
      routes: transformDataForDisplay(routes),
      serviceplans: transformDataForDisplay(servicePlans),
      paymentfreqs: transformDataForDisplay(paymentFreqs),
      kits: transformDataForDisplay(kits),
      wastecategories: transformDataForDisplay(wasteCategories),
      vehicles: transformDataForDisplay(vehicles),
      vendors: transformDataForDisplay(vendors),
      rawmaterials: transformDataForDisplay(rawMaterials),
      zones: transformDataForDisplay(zones)
    };
    return dataMap[activeSubModule] || [];
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = activeSubModule === 'categorymaster' ? '/api/categories' : `/api/${activeSubModule}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Failed to fetch ${activeSubModule}`);
      const data = await response.json();

      switch (activeSubModule) {
        case 'routes':         setRoutes(data || []);         break;
        case 'serviceplans':   setServicePlans(data || []);   break;
        case 'paymentfreqs':   setPaymentFreqs(data || []);   break;
        case 'kits':           setKits(data || []);           break;
        case 'wastecategories':setWasteCategories(data || []); break;
        case 'vehicles':       setVehicles(data || []);       break;
        case 'vendors':        setVendors(data || []);        break;
        case 'rawmaterials':   setRawMaterials(data || []);   break;
        case 'categorymaster': setCategories(data || []);     break;
        case 'zones':          setZones(data || []);          break;
        default: break;
      }
      setMessage({ type: '', text: '' });
    } catch (err) {
      console.error('Fetch error:', err);
      setMessage({ type: 'error', text: `Error loading data: ${err.message}` });
    } finally {
      setLoading(false);
    }
  }, [activeSubModule]);

  useEffect(() => {
    fetchData();
  }, [activeSubModule, fetchData]);

  const getAutoCode = () => {
    const codes = {
      routes: `RTE-${String(routes.length + 1).padStart(3, '0')}`,
      serviceplans: `PLAN-${String(servicePlans.length + 1).padStart(3, '0')}`,
      paymentfreqs: `FREQ-${String(paymentFreqs.length + 1).padStart(3, '0')}`,
      kits: `KIT-${String(kits.length + 1).padStart(3, '0')}`,
      wastecategories: `WC-${String(wasteCategories.length + 1).padStart(3, '0')}`,
      vehicles: `VEH-${String(vehicles.length + 1).padStart(3, '0')}`,
      vendors: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
      rawmaterials: `ITM-${String(rawMaterials.length + 1).padStart(3, '0')}`,
      categorymaster: `CAT-${String(categories.length + 1).padStart(3, '0')}`,
      zones: `ZNE-${String(zones.length + 1).padStart(3, '0')}`
    };
    return codes[activeSubModule] || 'AUTO';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      let body = {};
      let endpoint = `/api/${activeSubModule}`;
      let method = 'POST';

      if (activeSubModule === 'routes') {
        body = {
          routeCode: formData.code || getAutoCode(),
          routeName: formData.name,
          routeType: formData.type,
          primaryDriver: formData.primaryDriver,
          secondaryDriver: formData.secondaryDriver,
          status: formData.status ? 'Active' : 'Inactive'
        };
        if (editingId) {
          endpoint = `/api/routes/${editingId}`;
          method = 'PUT';
        }
      } else if (activeSubModule === 'serviceplans') {
        body = {
          planCode: formData.code || getAutoCode(),
          name: formData.name,
          category: formData.category,
          subCategory: formData.subCategory,
          zone: formData.zone,
          route: formData.route,
          description: formData.description,
          pricingType: formData.pricingType,
          monthlyCharges: parseFloat(formData.monthlyCharges) || 0,
          registrationCharges: parseFloat(formData.registrationCharges) || 0,
          consultingFees: parseFloat(formData.consultingFees) || 0,
          isActive: formData.isActive !== false,
          facilityTypes: formData.facilityTypes || '',
          planItems: planItems.filter(i => i.materialName || i.materialId),
        };
        if (editingId) {
          endpoint = `/api/serviceplans/${editingId}`;
          method = 'PUT';
        }
      } else if (activeSubModule === 'paymentfreqs') {
        body = {
          frequencyCode: formData.code || getAutoCode(),
          frequencyName: formData.frequencyName,
          months: parseInt(formData.months),
          discountAmt: parseFloat(formData.discountAmt) || 0,
          discountPct: parseFloat(formData.discountPct) || 0,
          description: formData.description,
          status: formData.status ? 'Active' : 'Inactive'
        };
        if (editingId) {
          endpoint = `/api/paymentfreqs/${editingId}`;
          method = 'PUT';
        }
      } else if (activeSubModule === 'kits') {
        body = {
          kitCode: formData.code || getAutoCode(),
          name: formData.name,
          type: formData.type,
          sellingPrice: parseFloat(formData.sellingPrice) || 0,
          costPrice: parseFloat(formData.costPrice) || 0,
          description: formData.description,
          isPopular: formData.isPopular || false,
          isActive: formData.isActive !== false,
          items: kitItems,
        };
        if (editingId) {
          endpoint = `/api/kits/${editingId}`;
          method = 'PUT';
        }
      } else if (activeSubModule === 'wastecategories') {
        body = {
          categoryCode: formData.code || getAutoCode(),
          name: formData.name,
          bagColor: formData.bagColor,
          colorCode: formData.colorCode,
          bmwSchedule: formData.bmwSchedule,
          hazardLevel: formData.hazardLevel,
          maxStorageDays: parseInt(formData.maxStorageDays) || 0,
          unitOfMeasurement: formData.unitOfMeasurement,
          description: formData.description,
          status: formData.status ? 'Active' : 'Inactive'
        };
        if (editingId) {
          endpoint = `/api/wastecategories/${editingId}`;
          method = 'PUT';
        }
      } else if (activeSubModule === 'vehicles') {
        body = {
          vehicleCode: formData.code || getAutoCode(),
          vehicleName: formData.name,
          category: formData.category,
          registrationNo: formData.registrationNo,
          manufacturer: formData.manufacturer,
          yearOfMfg: parseInt(formData.yearOfMfg) || new Date().getFullYear(),
          fuelType: formData.fuelType,
          status: formData.status ? 'Active' : 'Inactive'
        };
        if (editingId) {
          endpoint = `/api/vehicles/${editingId}`;
          method = 'PUT';
        }
      } else if (activeSubModule === 'vendors') {
        body = {
          vendorCode: formData.code || getAutoCode(),
          name: formData.name,
          type: formData.type,
          contactPerson: formData.contactPerson,
          mobile: formData.mobile,
          email: formData.email,
          website: formData.website,
          status: formData.status ? 'Active' : 'Inactive'
        };
        if (editingId) {
          endpoint = `/api/vendors/${editingId}`;
          method = 'PUT';
        }
      } else if (activeSubModule === 'rawmaterials') {
        body = {
          materialCode: formData.code || getAutoCode(),
          materialName: formData.name,
          type: formData.type,
          hsn: formData.hsn,
          description: formData.description,
          unitOfMeasurement: formData.unitOfMeasurement,
          status: formData.status ? 'Active' : 'Inactive'
        };
        if (editingId) {
          endpoint = `/api/rawmaterials/${editingId}`;
          method = 'PUT';
        }
      } else if (activeSubModule === 'zones') {
        body = {
          zoneName: formData.name,
          zoneType: formData.type,
          description: formData.description,
          isActive: formData.isActive !== false
        };
        if (editingId) {
          endpoint = `/api/zones/${editingId}`;
          method = 'PUT';
        }
      } else if (activeSubModule === 'categorymaster') {
        const validSubs = subCategoryItems.filter(s => s.name && s.name.trim());
        body = {
          categoryName: formData.name,
          subCategories: validSubs.map(s => s.name.trim())
        };
        if (editingId) {
          endpoint = `/api/categories/${editingId}`;
          method = 'PUT';
        } else {
          endpoint = '/api/categories';
        }
      }

      const response = await fetch(`${endpoint}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      setMessage({
        type: 'success',
        text: editingId ? 'Record updated successfully!' : 'Record created successfully!'
      });

      setShowModal(false);
      setFormData({});
      setEditingId(null);
      setKitItems([{ id: 1, item: '', hsn: '', qty: 1, unit: 'Pcs', rate: 0 }]);
      setSubCategoryItems([{ id: 1, name: '' }]);
      setPlanItems([]);
      fetchData();

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = () => {
    setEditingId(null);
    setFormData({});
    setSubCategoryItems([{ id: 1, name: '' }]);
    setPlanItems([]);
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleEdit = (item) => {
    // For categorymaster, CategoryID is the PK
    const id = activeSubModule === 'categorymaster'
      ? item.CategoryID
      : (item.ZoneID || item.RouteID || item.PlanID || item.FrequencyID || item.KitID || item.CategoryID || item.VehicleID || item.VendorID || item.MaterialID);
    setEditingId(id);

    // Pre-fill sub-category rows when editing a Category Master record
    if (activeSubModule === 'categorymaster') {
      const subs = item.SubCategories || [];
      setSubCategoryItems(
        subs.length > 0
          ? subs.map((s, i) => ({ id: i + 1, name: s.SubCategoryName }))
          : [{ id: 1, name: '' }]
      );
    }
    if (activeSubModule === 'serviceplans') {
      const items = item.PlanItems || [];
      setPlanItems(items.length > 0
        ? items.map((pi, i) => ({ id: i + 1, materialId: String(pi.MaterialID || ''), materialName: pi.MaterialName || '', uom: pi.UOM || 'Pcs', qty: pi.QtyPerVisit || 1, notes: pi.Notes || '' }))
        : []
      );
    }
    if (activeSubModule === 'kits') {
      const kItems = item.KitItems || [];
      setKitItems(kItems.length > 0
        ? kItems.map((ki, i) => ({ id: i+1, item: ki.ItemName || '', hsn: ki.HSNCode || '', qty: ki.Qty || 1, unit: ki.Unit || 'Pcs', rate: ki.Rate || 0 }))
        : [{ id: 1, item: '', hsn: '', qty: 1, unit: 'Pcs', rate: 0 }]
      );
    }
    // Normalise PascalCase API fields → camelCase formData the forms expect
    setFormData({
      ...item,
      name:           item.ZoneName || item.RouteName || item.PlanName || item.KitName || item.CategoryName || item.VehicleName || item.VendorName || item.MaterialName || item.name || '',
      code:           item.ZoneCode || item.RouteCode || item.PlanCode || item.FrequencyCode || item.KitCode || item.CategoryCode || item.VehicleCode || item.VendorCode || item.MaterialCode || '',
      type:           item.ZoneType || item.RouteType || item.VehicleType || item.KitType || item.VendorType || item.MaterialType || item.type || '',
      frequencyName:  item.FrequencyName || item.frequencyName || '',
      months:         item.Months || item.months || '',
      discountAmt:    item.DiscountAmount || item.discountAmt || '',
      discountPct:    item.DiscountPercentage || item.discountPct || '',
      primaryDriver:  item.PrimaryDriver || item.primaryDriver || '',
      secondaryDriver:item.SecondaryDriver || item.secondaryDriver || '',
      registrationNo: item.RegistrationNo || item.registrationNo || '',
      manufacturer:   item.Manufacturer || item.manufacturer || '',
      model:          item.Model || item.model || '',
      bagColor:       item.BagColor || item.bagColor || '',
      hazardLevel:    item.HazardLevel || item.hazardLevel || '',
      contactPerson:  item.ContactPerson || item.contactPerson || '',
      mobile:         item.Mobile || item.mobile || '',
      email:          item.Email || item.email || '',
      city:           item.City || item.city || '',
      hsnCode:        item.HSNCode || item.hsnCode || '',
      uom:            item.UOM || item.uom || '',
      unitPrice:      item.UnitPrice || item.unitPrice || '',
      monthlyCharges:      item.MonthlyCharges || item.monthlyCharges || '',
      sellingPrice:        item.SellingPrice != null ? item.SellingPrice : (item.sellingPrice || ''),
      costPrice:           item.CostPrice != null ? item.CostPrice : (item.costPrice || ''),
      registrationCharges: item.RegistrationCharges || item.registrationCharges || '',
      consultingFees:      item.ConsultingFees || item.consultingFees || '',
      zone:           item.Zone || item.zone || '',
      category:       item.Category || item.category || '',
      subCategory:    item.SubCategory || item.subCategory || '',
      route:          item.Route || item.route || '',
      pricingType:    item.PricingType || item.pricingType || 'fixed',
      facilityTypes:  item.FacilityTypes || item.facilityTypes || '',
      isPopular:      item.IsPopular === 1 || item.IsPopular === true || item.isPopular || false,
      status:         (item.IsActive === 1 || item.IsActive === true) ? 'Active' : 'Inactive',
      isActive:       item.IsActive === 1 || item.IsActive === true,
    });
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleView = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete this record?`)) return;

    try {
      setLoading(true);
      const itemId = item.ZoneID || item.RouteID || item.PlanID || item.FrequencyID || item.KitID || item.CategoryID || item.VehicleID || item.VendorID || item.MaterialID || item.id;
      const endpoint = activeSubModule === 'categorymaster'
        ? `/api/categories/${itemId}`
        : `/api/${activeSubModule}/${itemId}`;

      const response = await fetch(`${endpoint}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');

      setMessage({ type: 'success', text: 'Record deleted successfully!' });
      fetchData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setEditingId(null);
    setSubCategoryItems([{ id: 1, name: '' }]);
    setPlanItems([]);
  };

  // Form component renderer
  const renderForm = () => {
    if (activeSubModule === 'routes') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Route Code</label>
            <input type="text" value={getAutoCode()} readOnly style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', background: '#f1f5f9' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Route Name *</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Route name" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Route Type</label>
            <select name="type" value={formData.type || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Type</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Primary Driver</label>
            <input type="text" name="primaryDriver" value={formData.primaryDriver || ''} onChange={handleInputChange} placeholder="Driver name" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Secondary Driver</label>
            <input type="text" name="secondaryDriver" value={formData.secondaryDriver || ''} onChange={handleInputChange} placeholder="Driver name" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
              <input type="checkbox" name="status" checked={formData.status === 'Active'} onChange={handleInputChange} />
              <span>Active</span>
            </label>
          </div>
        </div>
      );
    } else if (activeSubModule === 'serviceplans') {
      return <ServicePlanForm formData={formData} handleInputChange={handleInputChange} getAutoCode={getAutoCode} planItems={planItems} setPlanItems={setPlanItems} />;
    } else if (activeSubModule === 'paymentfreqs') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Frequency Name *</label>
            <input type="text" name="frequencyName" value={formData.frequencyName || ''} onChange={handleInputChange} placeholder="e.g. Annual Plan" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Frequency (Months) *</label>
            <input type="number" name="months" value={formData.months || ''} onChange={handleInputChange} placeholder="e.g. 12" min="1" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Discount Amount (₹)</label>
              <input type="number" name="discountAmt" value={formData.discountAmt || ''} onChange={handleInputChange} placeholder="0.00" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Discount Percentage (%)</label>
              <input type="number" name="discountPct" value={formData.discountPct || ''} onChange={handleInputChange} placeholder="0.00" min="0" max="100" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
              <input type="checkbox" name="status" checked={formData.status === 'Active'} onChange={handleInputChange} />
              <span>Active</span>
            </label>
          </div>
        </div>
      );
    } else if (activeSubModule === 'vehicles') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Vehicle Code</label>
            <input type="text" value={getAutoCode()} readOnly style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', background: '#f1f5f9' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Vehicle Name *</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="e.g. Truck A" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Registration No</label>
            <input type="text" name="registrationNo" value={formData.registrationNo || ''} onChange={handleInputChange} placeholder="e.g. DL 01 AB 1234" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Category</label>
            <select name="category" value={formData.category || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Category</option>
              <option value="Pickup">Pickup</option>
              <option value="Mini Truck">Mini Truck</option>
              <option value="Full Truck">Full Truck</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
              <input type="checkbox" name="status" checked={formData.status === 'Active'} onChange={handleInputChange} />
              <span>Active</span>
            </label>
          </div>
        </div>
      );
    } else if (activeSubModule === 'zones') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Zone Code</label>
            <input type="text" value={getAutoCode()} readOnly style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', background: '#f1f5f9' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Zone Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="e.g. Roorkee, Haridwar, North Uttarakhand" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Zone Type</label>
            <select name="type" value={formData.type || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Type</option>
              <option value="City">City</option>
              <option value="District">District</option>
              <option value="Region">Region</option>
              <option value="State">State</option>
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Zone description..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', minHeight: '70px', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" name="isActive" checked={formData.isActive !== false} onChange={handleInputChange} />
              <span>Active</span>
            </label>
          </div>
        </div>
      );
    } else if (activeSubModule === 'categorymaster') {
      return (
        <div style={{ padding: '20px' }}>
          {/* Category Name */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
              Category Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="e.g. Biomedical Waste"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Sub-Categories */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>Sub-Categories</label>
              <button
                type="button"
                onClick={() => setSubCategoryItems(prev => [...prev, { id: Date.now(), name: '' }])}
                style={{ background: '#ede9fe', border: 'none', color: '#7c3aed', fontSize: '12px', fontWeight: '700', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}
              >
                + Add Sub-Category
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {subCategoryItems.map((sub, idx) => (
                <div key={sub.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ background: '#7c3aed', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    value={sub.name}
                    onChange={e => setSubCategoryItems(prev => prev.map(s => s.id === sub.id ? { ...s, name: e.target.value } : s))}
                    placeholder={`Sub-Category ${idx + 1} name...`}
                    style={{ flex: 1, padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                  {subCategoryItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSubCategoryItems(prev => prev.filter(s => s.id !== sub.id))}
                      style={{ background: '#fee2e2', border: 'none', color: '#dc2626', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}
                    >×</button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              💡 These sub-categories will appear in the <strong>Sub-Category</strong> dropdown of Service Plan Master when this category is selected.
            </div>
          </div>
        </div>
      );
    } else if (activeSubModule === 'kits') {
      const subTotal = kitItems.reduce((s, it) => s + ((parseFloat(it.qty)||0)*(parseFloat(it.rate)||0)), 0);
      const cgst = Math.round(subTotal * 0.09 * 100) / 100;
      const sgst = cgst;
      const grandTotal = subTotal + cgst + sgst;
      const inp2 = { width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' };
      return (
        <div style={{ padding: '20px' }}>
          {/* KIT INFORMATION */}
          <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7c3aed', marginBottom: '14px' }}>Kit Information</div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '5px' }}>Kit Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="e.g. Hospital Standard Kit" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '5px' }}>Kit Type <span style={{ color: '#dc2626' }}>*</span></label>
              <select name="type" value={formData.type || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
                <option value="">Select Type</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '5px' }}>Selling Price (₹)</label>
              <input type="number" name="sellingPrice" value={formData.sellingPrice || ''} onChange={handleInputChange} placeholder="0.00" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '5px' }}>Cost Price (₹)</label>
              <input type="number" name="costPrice" value={formData.costPrice || ''} onChange={handleInputChange} placeholder="0.00" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '5px' }}>Status</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', cursor: 'pointer' }}>
                <div onClick={() => handleInputChange({ target: { name: 'isActive', type: 'checkbox', checked: formData.isActive === false } })}
                  style={{ width: '40px', height: '22px', borderRadius: '11px', background: formData.isActive !== false ? '#7c3aed' : '#cbd5e1', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: '3px', left: formData.isActive !== false ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}></div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Active</span>
              </label>
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '5px' }}>Description / Best For</label>
            <textarea name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Who is this kit best suited for?" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', minHeight: '70px', fontFamily: 'inherit' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" name="isPopular" checked={!!formData.isPopular} onChange={handleInputChange} />
              <span style={{ fontWeight: '600' }}>Mark as Popular</span>
            </label>
          </div>

          {/* KIT ITEMS */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7c3aed' }}>Kit Items</div>
              <button type="button" onClick={() => setKitItems(prev => [...prev, { id: Date.now(), item: '', hsn: '', qty: 1, unit: 'Pcs', rate: 0 }])}
                style={{ background: '#ede9fe', border: 'none', color: '#7c3aed', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                + Add Item
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '7px 8px', textAlign: 'left', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>Item Name</th>
                  <th style={{ padding: '7px 8px', textAlign: 'left', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #e2e8f0', width: '80px' }}>HSN/SAC</th>
                  <th style={{ padding: '7px 8px', textAlign: 'center', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #e2e8f0', width: '50px' }}>QTY</th>
                  <th style={{ padding: '7px 8px', textAlign: 'left', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #e2e8f0', width: '65px' }}>Unit</th>
                  <th style={{ padding: '7px 8px', textAlign: 'right', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #e2e8f0', width: '70px' }}>Rate (₹)</th>
                  <th style={{ padding: '7px 8px', textAlign: 'right', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #e2e8f0', width: '70px' }}>Amount</th>
                  <th style={{ width: '28px', borderBottom: '1px solid #e2e8f0' }}></th>
                </tr>
              </thead>
              <tbody>
                {kitItems.map((row, idx) => {
                  const amt = ((parseFloat(row.qty)||0) * (parseFloat(row.rate)||0));
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '5px 6px' }}><input type="text" value={row.item} onChange={e => setKitItems(prev => prev.map(r => r.id===row.id ? {...r, item: e.target.value} : r))} placeholder="Item name" style={inp2} /></td>
                      <td style={{ padding: '5px 6px' }}><input type="text" value={row.hsn} onChange={e => setKitItems(prev => prev.map(r => r.id===row.id ? {...r, hsn: e.target.value} : r))} placeholder="HSN" style={inp2} /></td>
                      <td style={{ padding: '5px 6px' }}><input type="number" value={row.qty} min="0" onChange={e => setKitItems(prev => prev.map(r => r.id===row.id ? {...r, qty: e.target.value} : r))} style={{...inp2, textAlign:'center'}} /></td>
                      <td style={{ padding: '5px 6px' }}>
                        <select value={row.unit} onChange={e => setKitItems(prev => prev.map(r => r.id===row.id ? {...r, unit: e.target.value} : r))} style={inp2}>
                          <option>Pcs</option><option>Kg</option><option>Ltr</option><option>Box</option><option>Roll</option><option>Set</option>
                        </select>
                      </td>
                      <td style={{ padding: '5px 6px' }}><input type="number" value={row.rate} min="0" onChange={e => setKitItems(prev => prev.map(r => r.id===row.id ? {...r, rate: e.target.value} : r))} style={{...inp2, textAlign:'right'}} /></td>
                      <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: '600', color: '#1e293b' }}>₹{amt.toFixed(2)}</td>
                      <td style={{ padding: '5px 6px', textAlign: 'center' }}>
                        <button type="button" onClick={() => setKitItems(prev => prev.filter(r => r.id !== row.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Totals */}
            <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}><span>Sub Total</span><span>₹{subTotal.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}><span>CGST 9%</span><span>₹{cgst.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}><span>SGST 9%</span><span>₹{sgst.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', color: '#1e293b', borderTop: '2px solid #1e293b', paddingTop: '8px' }}><span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ padding: '20px' }}>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Form for {activeSubModule} (Basic form coming soon)</p>
        </div>
      );
    }
  };

  // Returns raw API data for the active module
  const getRawData = () => {
    const map = {
      routes, serviceplans: servicePlans, paymentfreqs: paymentFreqs, kits,
      wastecategories: wasteCategories, vehicles, vendors, rawmaterials: rawMaterials,
      categorymaster: categories, zones
    };
    return map[activeSubModule] || [];
  };

  const statusBadge = (isActive) => (
    <span style={{
      background: isActive ? '#dcfce7' : '#fee2e2',
      color:      isActive ? '#15803d' : '#dc2626',
      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'
    }}>{isActive ? 'Active' : 'Inactive'}</span>
  );

  const actionBtns = (row) => (
    <td style={{ whiteSpace: 'nowrap' }}>
      <div style={{ display:'flex', gap:5 }}>
        <button onClick={() => handleView(row)} style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)', border:'none', color:'#fff', cursor:'pointer', fontSize:'11px', fontWeight:'800', padding:'5px 11px', borderRadius:'6px', boxShadow:'0 2px 6px rgba(124,58,237,0.3)' }}>👁 View</button>
        <button onClick={() => handleEdit(row)} style={{ background:'linear-gradient(135deg,#0369a1,#0ea5e9)', border:'none', color:'#fff', cursor:'pointer', fontSize:'11px', fontWeight:'800', padding:'5px 11px', borderRadius:'6px', boxShadow:'0 2px 6px rgba(3,105,161,0.3)' }}>✏ Edit</button>
        <button onClick={() => handleDelete(row)} style={{ background:'linear-gradient(135deg,#dc2626,#ef4444)', border:'none', color:'#fff', cursor:'pointer', fontSize:'11px', fontWeight:'800', padding:'5px 11px', borderRadius:'6px', boxShadow:'0 2px 6px rgba(220,38,38,0.3)' }}>🗑</button>
      </div>
    </td>
  );

  const td = (val, bold) => (
    <td style={{ fontWeight: bold ? '700' : '500', color: '#0f172a' }}>{val || '—'}</td>
  );

  const renderRowCells = (row) => {
    switch (activeSubModule) {
      case 'zones':
        return (<>
          {td(row.ZoneCode, true)}
          {td(row.ZoneName)}
          {td(row.ZoneType)}
          <td>{statusBadge(row.IsActive)}</td>
          {actionBtns(row)}
        </>);
      case 'routes':
        return (<>
          {td(row.RouteCode, true)}
          {td(row.RouteName)}
          {td(row.RouteType)}
          {td(row.PrimaryDriver)}
          {td(row.SecondaryDriver)}
          <td>{statusBadge(row.IsActive)}</td>
          {actionBtns(row)}
        </>);
      case 'serviceplans':
        return (<>
          {td(row.PlanCode, true)}
          {td(row.PlanName)}
          {td(row.Category)}
          {td(row.FacilityTypes || 'All')}
          {td(row.MonthlyCharges != null ? `₹${Number(row.MonthlyCharges).toLocaleString('en-IN')}` : '—')}
          <td>{statusBadge(row.IsActive)}</td>
          {actionBtns(row)}
        </>);
      case 'paymentfreqs':
        return (<>
          {td(row.FrequencyName, true)}
          {td(row.Months ? `${row.Months} months` : '—')}
          {td(row.DiscountAmount ? `₹${row.DiscountAmount}` : '—')}
          {td(row.DiscountPercentage ? `${row.DiscountPercentage}%` : '—')}
          <td>{statusBadge(row.IsActive)}</td>
          {actionBtns(row)}
        </>);
      case 'kits':
        return (<>
          {td(row.KitCode, true)}
          {td(row.KitName)}
          {td(row.KitType)}
          {td(`₹${Number(row.SellingPrice || 0).toLocaleString('en-IN')}`)}
          <td>{statusBadge(row.IsActive)}</td>
          {actionBtns(row)}
        </>);
      case 'wastecategories':
        return (<>
          {td(row.CategoryCode, true)}
          {td(row.CategoryName)}
          <td><span style={{ background: row.BagColor === 'Yellow' ? '#fef9c3' : row.BagColor === 'Red' ? '#fee2e2' : row.BagColor === 'Green' ? '#dcfce7' : row.BagColor === 'Black' ? '#1e293b' : '#f1f5f9', color: row.BagColor === 'Black' ? '#fff' : '#0f172a', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{row.BagColor || '—'}</span></td>
          {td(row.HazardLevel)}
          {td(row.MaxStorageDays ? `${row.MaxStorageDays} days` : '—')}
          {actionBtns(row)}
        </>);
      case 'vehicles':
        return (<>
          {td(row.VehicleCode, true)}
          {td(row.RegistrationNo)}
          {td(row.VehicleType)}
          {td(row.Manufacturer)}
          {td(row.Model)}
          <td>{statusBadge(row.IsActive)}</td>
          {actionBtns(row)}
        </>);
      case 'vendors':
        return (<>
          {td(row.VendorCode, true)}
          {td(row.VendorName)}
          {td(row.VendorType)}
          {td(row.ContactPerson)}
          {td(row.Email || row.Mobile)}
          <td>{statusBadge(row.IsActive)}</td>
          {actionBtns(row)}
        </>);
      case 'categorymaster':
        return (<>
          {td(row.CategoryID, true)}
          {td(row.CategoryName)}
          <td>
            {row.SubCategories && row.SubCategories.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {row.SubCategories.slice(0, 4).map(s => (
                  <span key={s.SubCategoryID} style={{ background: '#ede9fe', color: '#6d28d9', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px' }}>
                    {s.SubCategoryName}
                  </span>
                ))}
                {row.SubCategories.length > 4 && (
                  <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '11px', padding: '2px 8px', borderRadius: '12px' }}>
                    +{row.SubCategories.length - 4} more
                  </span>
                )}
              </div>
            ) : <span style={{ color: '#94a3b8', fontSize: '12px' }}>No sub-categories</span>}
          </td>
          <td>{statusBadge(row.IsActive)}</td>
          {actionBtns(row)}
        </>);
      case 'rawmaterials':
        return (<>
          {td(row.MaterialCode, true)}
          {td(row.MaterialName)}
          {td(row.MaterialType)}
          {td(row.HSNCode)}
          <td>{statusBadge(row.IsActive)}</td>
          {actionBtns(row)}
        </>);
      default:
        return <td colSpan={8}>—</td>;
    }
  };

  const content = getSubModuleContent();
  const currentData = getCurrentData();

  return (
    <div style={{ display: 'flex', gap: '0', minHeight: '100vh', position: 'relative' }}>
      {/* Submenu Sidebar */}
      <div className={`submenu-sidebar${sidebarCollapsed ? ' collapsed' : ''}`} style={{
        width: sidebarCollapsed ? 60 : 240,
        minWidth: sidebarCollapsed ? 60 : 240,
        transition: 'all 0.3s ease',
      }}>
        <div className="submenu-header" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          padding: sidebarCollapsed ? '16px 8px' : '16px 18px',
        }}>
          {!sidebarCollapsed && <span>Master Data</span>}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 6,
              padding: '6px 8px',
              cursor: 'pointer',
              color: '#a5b4fc',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>
        {subMenuItems.map(item => (
          <button
            key={item.id}
            className={`submenu-item ${activeSubModule === item.id ? 'active' : ''}`}
            onClick={() => setActiveSubModule(item.id)}
            style={{
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              padding: sidebarCollapsed ? '12px 8px' : '12px 18px',
            }}
            title={sidebarCollapsed ? item.label : ''}
          >
            <span className="submenu-icon" style={{ 
              marginRight: sidebarCollapsed ? 0 : 12,
              fontSize: sidebarCollapsed ? 20 : 18,
            }}>{item.icon}</span>
            {!sidebarCollapsed && <span className="submenu-label">{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="submenu-content">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>{content.title}</h1>
            <p>{content.description}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={handleOpenForm} disabled={loading}>+ Add {content.title.split(' ')[0]}</button>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
            background: message.type === 'error' ? '#fee2e2' : '#d1fae5',
            color: message.type === 'error' ? '#991b1b' : '#065f46',
            fontSize: '13px'
          }}>
            {message.text}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="creg-stats">
          {content.stats && content.stats.map((stat, idx) => (
            <div key={idx} className={`creg-stat ${stat.className}`}>
              <span className="creg-stat-val">{stat.value}</span>
              <span className="creg-stat-lbl">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Table Section */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading data...</div>
        ) : (
          <>
          {/* Row count info */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ fontSize:12, color:'#64748b', fontWeight:600 }}>
              Showing <strong style={{ color:'#1e293b' }}>{getRawData().length}</strong> records
            </span>
          </div>

          <div className="table-wrap">
            <table style={{ minWidth: '900px' }}>
              <thead>
                <tr>
                  {content.columns && content.columns.map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getRawData().length > 0 ? (
                  getRawData().map((row, idx) => (
                    <tr key={idx}>
                      {renderRowCells(row)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={content.columns.length} style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontSize: '14px', fontWeight:600 }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                      No data found. Click <strong>+ Add</strong> to create the first record.
                    </td>
                  </tr>
                )}
              </tbody>
              {getRawData().length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={content.columns.length - 1}>📊 Total: {getRawData().length} records</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          </>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', maxWidth: '600px', width: '90%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0' }}>
                {editingId ? `Edit ${content.title}` : `Add ${content.title}`}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>

            {renderForm()}

            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', color: '#1e293b', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={loading} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: loading ? '#cbd5e1' : '#7c3aed', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ════ VIEW MODAL ════ */}
      {showViewModal && viewItem && (
        <div style={{ position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(15,23,42,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1100,padding:'16px' }}
             onClick={() => setShowViewModal(false)}>
          <div style={{ background:'#fff',borderRadius:'14px',width:'100%',maxWidth:'560px',maxHeight:'88vh',display:'flex',flexDirection:'column',boxShadow:'0 25px 50px rgba(0,0,0,0.25)',overflow:'hidden' }}
               onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ background:'linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)',padding:'18px 22px',display:'flex',alignItems:'center',gap:'12px' }}>
              <div style={{ width:'42px',height:'42px',background:'rgba(255,255,255,0.15)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0 }}>
                {content.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'#fff',fontWeight:'700',fontSize:'16px' }}>
                  {viewItem.RouteName || viewItem.PlanName || viewItem.FrequencyName || viewItem.KitName || viewItem.CategoryName || viewItem.VehicleCode || viewItem.VendorName || viewItem.MaterialName || viewItem.name || 'Record Details'}
                </div>
                <div style={{ color:'rgba(255,255,255,0.7)',fontSize:'12px',marginTop:'2px' }}>{content.title}</div>
              </div>
              <span style={{ background:'rgba(255,255,255,0.2)',color:'#fff',fontSize:'11px',fontWeight:'700',padding:'3px 12px',borderRadius:'20px' }}>
                {viewItem.IsActive ? 'Active' : 'Inactive'}
              </span>
              <button onClick={() => setShowViewModal(false)} style={{ background:'rgba(255,255,255,0.15)',border:'none',color:'#fff',fontSize:'18px',cursor:'pointer',width:'30px',height:'30px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
            </div>
            {/* Body */}
            <div style={{ flex:1,overflow:'auto',padding:'20px' }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
                {Object.entries(viewItem)
                  .filter(([k]) => !['IsActive','CreatedAt','UpdatedAt','SubCategories','KitItems'].includes(k))
                  .map(([key, val]) => val != null && val !== '' ? (
                    <div key={key} style={{ background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'10px 12px' }}>
                      <div style={{ fontSize:'10px',color:'#94a3b8',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'4px' }}>
                        {key.replace(/([A-Z])/g,' $1').trim()}
                      </div>
                      <div style={{ fontSize:'13px',color:'#0f172a',fontWeight:'700',wordBreak:'break-word' }}>{String(val)}</div>
                    </div>
                  ) : null)}
              </div>

              {/* SubCategories — rendered as pills for Category Master */}
              {viewItem.SubCategories && Array.isArray(viewItem.SubCategories) && (
                <div style={{ marginTop:'12px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'12px' }}>
                  <div style={{ fontSize:'10px',color:'#94a3b8',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'10px' }}>
                    Sub-Categories ({viewItem.SubCategories.length})
                  </div>
                  {viewItem.SubCategories.length > 0 ? (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                      {viewItem.SubCategories.map(s => (
                        <span key={s.SubCategoryID} style={{ background:'#ede9fe', color:'#6d28d9', fontSize:'12px', fontWeight:'600', padding:'4px 12px', borderRadius:'20px', border:'1px solid #c4b5fd' }}>
                          {s.SubCategoryName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize:'12px', color:'#94a3b8' }}>No sub-categories added</span>
                  )}
                </div>
              )}

              {/* KitItems — rendered as table for Kit Master */}
              {viewItem.KitItems && Array.isArray(viewItem.KitItems) && viewItem.KitItems.length > 0 && (
                <div style={{ marginTop:'12px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'12px' }}>
                  <div style={{ fontSize:'10px',color:'#7c3aed',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'10px' }}>
                    Kit Items ({viewItem.KitItems.length})
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                    <thead>
                      <tr style={{ background:'#ede9fe' }}>
                        <th style={{ padding:'6px 8px', textAlign:'left', fontWeight:'600', color:'#6d28d9', borderBottom:'1px solid #c4b5fd' }}>Item</th>
                        <th style={{ padding:'6px 8px', textAlign:'left', fontWeight:'600', color:'#6d28d9', borderBottom:'1px solid #c4b5fd' }}>HSN</th>
                        <th style={{ padding:'6px 8px', textAlign:'center', fontWeight:'600', color:'#6d28d9', borderBottom:'1px solid #c4b5fd' }}>Qty</th>
                        <th style={{ padding:'6px 8px', textAlign:'left', fontWeight:'600', color:'#6d28d9', borderBottom:'1px solid #c4b5fd' }}>Unit</th>
                        <th style={{ padding:'6px 8px', textAlign:'right', fontWeight:'600', color:'#6d28d9', borderBottom:'1px solid #c4b5fd' }}>Rate</th>
                        <th style={{ padding:'6px 8px', textAlign:'right', fontWeight:'600', color:'#6d28d9', borderBottom:'1px solid #c4b5fd' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewItem.KitItems.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom:'1px solid #e2e8f0' }}>
                          <td style={{ padding:'6px 8px', color:'#1e293b', fontWeight:'500' }}>{item.item || item.ItemName || '-'}</td>
                          <td style={{ padding:'6px 8px', color:'#64748b' }}>{item.hsn || item.HSN || '-'}</td>
                          <td style={{ padding:'6px 8px', textAlign:'center', color:'#1e293b' }}>{item.qty || item.Qty || 0}</td>
                          <td style={{ padding:'6px 8px', color:'#64748b' }}>{item.unit || item.Unit || '-'}</td>
                          <td style={{ padding:'6px 8px', textAlign:'right', color:'#1e293b' }}>₹{item.rate || item.Rate || 0}</td>
                          <td style={{ padding:'6px 8px', textAlign:'right', fontWeight:'600', color:'#0f172a' }}>₹{((item.qty || item.Qty || 0) * (item.rate || item.Rate || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background:'#f1f5f9' }}>
                        <td colSpan="5" style={{ padding:'8px', textAlign:'right', fontWeight:'700', color:'#1e293b' }}>Total:</td>
                        <td style={{ padding:'8px', textAlign:'right', fontWeight:'700', color:'#7c3aed' }}>
                          ₹{viewItem.KitItems.reduce((sum, item) => sum + ((item.qty || item.Qty || 0) * (item.rate || item.Rate || 0)), 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              <div style={{ marginTop:'14px',display:'flex',gap:'8px',fontSize:'12px',color:'#64748b' }}>
                {viewItem.CreatedAt && <span>Created: {new Date(viewItem.CreatedAt).toLocaleDateString('en-IN')}</span>}
                {viewItem.UpdatedAt && <span>· Updated: {new Date(viewItem.UpdatedAt).toLocaleDateString('en-IN')}</span>}
              </div>
            </div>
            {/* Footer */}
            <div style={{ borderTop:'1px solid #e2e8f0',padding:'12px 20px',display:'flex',gap:'10px',justifyContent:'flex-end',background:'#f8fafc' }}>
              <button onClick={() => { setShowViewModal(false); handleEdit(viewItem); }} style={{ background:'#dbeafe',color:'#1d4ed8',border:'none',borderRadius:'8px',padding:'8px 16px',fontSize:'13px',fontWeight:'600',cursor:'pointer' }}>✏️ Edit</button>
              <button onClick={() => setShowViewModal(false)} style={{ background:'none',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'8px 16px',fontSize:'13px',fontWeight:'600',cursor:'pointer',color:'#475569' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataModule;
