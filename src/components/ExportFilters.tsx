import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Filter, 
  Plus, 
  X, 
  Calendar,
  Building,
  CheckCircle,
  Euro,
  Clock
} from "lucide-react";
import type { ExportFilter, FilterType } from "@/types/export";

interface ExportFiltersProps {
  filters: ExportFilter[];
  onFiltersChange: (filters: ExportFilter[]) => void;
  availableSuppliers?: string[];
  availableStatuses?: string[];
  availableCurrencies?: string[];
}

const ExportFilters: React.FC<ExportFiltersProps> = ({
  filters,
  onFiltersChange,
  availableSuppliers = [],
  availableStatuses = [],
  availableCurrencies = []
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newFilter, setNewFilter] = useState<Partial<ExportFilter>>({
    type: 'dateRange',
    operator: 'between'
  });

  const filterTypes: { type: FilterType; name: string; icon: React.ReactNode; description: string }[] = [
    {
      type: 'dateRange',
      name: 'Date Range',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Filter by invoice date range'
    },
    {
      type: 'supplier',
      name: 'Supplier',
      icon: <Building className="h-4 w-4" />,
      description: 'Filter by specific suppliers'
    },
    {
      type: 'status',
      name: 'Status',
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Filter by invoice status'
    },
    {
      type: 'amount',
      name: 'Amount',
      icon: <Euro className="h-4 w-4" />,
      description: 'Filter by amount range'
    },
    {
      type: 'currency',
      name: 'Currency',
      icon: <Euro className="h-4 w-4" />,
      description: 'Filter by currency type'
    }
  ];

  const addFilter = () => {
    if (newFilter.type && newFilter.name && newFilter.value) {
      const filter: ExportFilter = {
        id: Math.random().toString(36).substr(2, 9),
        name: newFilter.name,
        type: newFilter.type,
        value: newFilter.value,
        operator: newFilter.operator || 'equals'
      };
      
      onFiltersChange([...filters, filter]);
      setNewFilter({ type: 'dateRange', operator: 'between' });
      setIsAdding(false);
    }
  };

  const removeFilter = (filterId: string) => {
    onFiltersChange(filters.filter(f => f.id !== filterId));
  };

  const updateFilter = (filterId: string, updates: Partial<ExportFilter>) => {
    onFiltersChange(filters.map(f => 
      f.id === filterId ? { ...f, ...updates } : f
    ));
  };

  const getFilterIcon = (type: FilterType) => {
    const filterType = filterTypes.find(ft => ft.type === type);
    return filterType?.icon || <Filter className="h-4 w-4" />;
  };

  const getFilterName = (type: FilterType) => {
    const filterType = filterTypes.find(ft => ft.type === type);
    return filterType?.name || type;
  };

  const renderFilterInput = (filter: ExportFilter) => {
    switch (filter.type) {
      case 'dateRange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={filter.value?.start || ''}
              onChange={(e) => updateFilter(filter.id, {
                value: { ...filter.value, start: e.target.value }
              })}
              placeholder="Start date"
            />
            <Input
              type="date"
              value={filter.value?.end || ''}
              onChange={(e) => updateFilter(filter.id, {
                value: { ...filter.value, end: e.target.value }
              })}
              placeholder="End date"
            />
          </div>
        );
      
      case 'supplier':
        return (
          <select
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select supplier</option>
            {availableSuppliers.map(supplier => (
              <option key={supplier} value={supplier}>{supplier}</option>
            ))}
          </select>
        );
      
      case 'status':
        return (
          <select
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select status</option>
            {availableStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        );
      
      case 'amount':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={filter.value?.min || ''}
              onChange={(e) => updateFilter(filter.id, {
                value: { ...filter.value, min: parseFloat(e.target.value) || 0 }
              })}
              placeholder="Min amount"
            />
            <Input
              type="number"
              value={filter.value?.max || ''}
              onChange={(e) => updateFilter(filter.id, {
                value: { ...filter.value, max: parseFloat(e.target.value) || 0 }
              })}
              placeholder="Max amount"
            />
          </div>
        );
      
      case 'currency':
        return (
          <select
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select currency</option>
            {availableCurrencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        );
      
      default:
        return (
          <Input
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder="Enter value"
          />
        );
    }
  };

  const getFilterDescription = (filter: ExportFilter) => {
    switch (filter.type) {
      case 'dateRange':
        return `Date range: ${filter.value?.start || 'Start'} to ${filter.value?.end || 'End'}`;
      case 'supplier':
        return `Supplier: ${filter.value || 'Any'}`;
      case 'status':
        return `Status: ${filter.value || 'Any'}`;
      case 'amount':
        return `Amount: ${filter.value?.min || '0'} to ${filter.value?.max || '∞'}`;
      case 'currency':
        return `Currency: ${filter.value || 'Any'}`;
      default:
        return `${filter.name}: ${filter.value}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Export Filters
          </CardTitle>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            variant={isAdding ? "outline" : "default"}
            size="sm"
          >
            {isAdding ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Filter
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Filter your data before exporting to get exactly what you need
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add New Filter */}
        {isAdding && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filterType">Filter Type</Label>
                <select
                  id="filterType"
                  value={newFilter.type || ''}
                  onChange={(e) => setNewFilter(prev => ({ 
                    ...prev, 
                    type: e.target.value as FilterType 
                  }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select filter type</option>
                  {filterTypes.map(type => (
                    <option key={type.type} value={type.type}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="filterName">Filter Name</Label>
                <Input
                  id="filterName"
                  value={newFilter.name || ''}
                  onChange={(e) => setNewFilter(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter filter name"
                />
              </div>
            </div>
            
            {newFilter.type && (
              <div>
                <Label>Filter Value</Label>
                {renderFilterInput({
                  id: 'temp',
                  name: newFilter.name || '',
                  type: newFilter.type,
                  value: newFilter.value,
                  operator: newFilter.operator
                } as ExportFilter)}
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={addFilter}>
                Add Filter
              </Button>
            </div>
          </div>
        )}

        {/* Existing Filters */}
        {filters.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Filters Applied
            </h3>
            <p className="text-gray-600">
              Add filters to narrow down your export data
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getFilterIcon(filter.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{filter.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getFilterName(filter.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {getFilterDescription(filter)}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Filter Summary */}
        {filters.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {filters.length} filter{filters.length !== 1 ? 's' : ''} applied
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Your export will include only records matching these criteria
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportFilters;

