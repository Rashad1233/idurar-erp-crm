import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { TabsContent } from '@/components/tabs';

export default function WarehousePage() {
  return (
    <div>
      <h1>Warehouse Management</h1>
      <div>
        <Link href="/warehouse/location/create">
          <Button variant="outline">Create Storage Location</Button>
        </Link>
      </div>
      <div>
        <Link href="/warehouse/bin/create">
          <Button variant="outline">Create Bin Location</Button>
        </Link>
      </div>
      <TabsContent value="storage-locations">
        <DataTable
          namespace="Warehouse/storage-location"
          columns={storageLocationColumns}
          data={storageLocations}
          onCreateNew="/warehouse/location/create" // Updated route
        />
      </TabsContent>
      <TabsContent value="bins">
        <DataTable
          namespace="Warehouse/bin-location"
          columns={binLocationColumns}
          data={binLocations}
          onCreateNew="/warehouse/bin/create" // Updated route
        />
      </TabsContent>
    </div>
  );
}