import { useBreadcrumb } from '@components/admin-breadcrumb/AdminBreadcrumb';
import DataTable from '@components/data-table/DataTable';
import TopBar, { TopbarAction } from '@components/data-table/Topbar';
import { ReassignPanel } from '@components/reassign/ReassignPanel';
import ResumeDetailPanel from '@components/resume-details/ResumeDetailPanel';
import { ResumeUpdateStatusPanel, UpdateResumeStatusSchema } from '@components/resume-details/ResumeUpdateStatusPanel';
import StatusBadge from '@components/resume-details/StatusBadge';
import { useUpdateResumeStatus } from '@components/resume-details/useUpdateResumeStatus';
import { ResumeTableFilter, useDeleteResume, useResumeList } from '@components/resume-list';
import Button from '@components/tailus-ui/Button';
import { Text } from '@components/tailus-ui/typography';
import { useEffectOnce } from '@hooks/useEffectOnce';
import { useUser } from '@lib/auth';
import { Resume, SchoolarShip } from '@lib/types';
import { DownloadIcon } from '@radix-ui/react-icons';
import { IconAbacus, IconEye, IconTransfer } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

function AdminResume() {
  const { setItems } = useBreadcrumb();
  useEffectOnce(() => {
    setItems([
      {
        title: 'Quản lý CV',
        href: '/admin/resume',
      },
    ]);
  });

  const [selectedItems, setSelectedItems] = useState<Resume[]>();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [isUpdateStatusPanelOpen, setIsUpdateStatusPanelOpen] = useState(false);
  const [tranferPanelOpen, setTranferPanelOpen] = useState(false);
  const [filter, setFilter] = useState<Record<string, any>>();

  const user = useUser();
  const { data, isFetchingNextPage, fetchNextPage, isLoading } = useResumeList({
    filter: {
      ...filter,
      provider: user?.provider,
    },
  });

  const { mutateAsync: updateStatus } = useUpdateResumeStatus();
  const { mutateAsync: deleteResume } = useDeleteResume();

  const onSelect = (ids: string[]) => {
    const filtered = items.filter((item) => ids.includes(item._id)) ?? [];
    setSelectedItems(filtered);
  };

  const onStatusUpdate = async (data: UpdateResumeStatusSchema) => {
    toast.promise(updateStatus(data), {
      loading: 'Đang cập nhật trạng thái...',
      success: (res) => {
        setIsUpdateStatusPanelOpen(false);
        if (data.status === 'Thanh toán lần 2') {
          console.log(res);
          const paymentLink = res.data.data.payment.checkoutUrl;
          // copy to clipboard
          navigator.clipboard.writeText(paymentLink);
          toast.info('Xem chi tiết để xem lại link');
          return `Cập nhật trạng thái thành công. Link thanh toán đã được copy vào clipboard`;
        }
        return 'Cập nhật trạng thái thành công';
      },
      error: (err) => err.message,
    });
  };

  const onDelete = useCallback(async () => {
    if (selectedItems?.length === 1) {
      toast.promise(deleteResume(selectedItems[0]._id), {
        loading: 'Đang xóa...',
        success: () => {
          setSelectedItems([]);
          return 'Xóa thành công';
        },
        error: (err) => err.message,
      });
    }
  }, [deleteResume, selectedItems]);

  const actions = useMemo<TopbarAction[][]>(
    () => [
      selectedItems?.length === 1
        ? [
            {
              label: 'Xem chi tiết',
              icon: <IconEye />,
              size: 'sm',
              variant: 'soft',
              onClick: () => setIsDetailPanelOpen(true),
            },
            {
              label: 'Cập nhật trạng thái',
              size: 'sm',
              variant: 'soft',
              intent: 'secondary',
              onClick: () => setIsUpdateStatusPanelOpen(true),
              icon: <IconAbacus />,
            },
            {
              label: 'Giao staff xử lý',
              size: 'sm',
              variant: 'soft',
              intent: 'success',
              onClick: () => setTranferPanelOpen(true),
              icon: <IconTransfer />,
            },
            {
              label: 'Xóa',
              size: 'sm',
              variant: 'soft',
              intent: 'danger',
              onClick: () => {
                onDelete();
              },
            },
          ]
        : [],
    ],
    [onDelete, selectedItems?.length]
  );

  const columns = useMemo<ColumnDef<Resume>[]>(
    () => [
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (row) => <Text size="sm">{row.getValue() as string}</Text>,
      },
      {
        accessorKey: 'name',
        header: 'Họ và tên',
        cell: (row) => <Text size="sm">{row.getValue() as string}</Text>,
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: (row) => <StatusBadge status={row.getValue() as string} />,
      },
      {
        accessorKey: 'scholarship',
        header: 'Học bổng',
        cell: (row) => {
          const scholarship = row.getValue() as Pick<SchoolarShip, '_id' | 'name'>;
          return (
            <Text size="sm" className="max-w-[400px] ">
              {scholarship?.name}
            </Text>
          );
        },
      },
      {
        accessorKey: 'user',
        header: 'Staff',
        cell: (row) => {
          const scholarship = row.getValue() as { name: string };
          return <Text size="sm">{scholarship?.name}</Text>;
        },
      },
      {
        accessorKey: 'orderCode',
        header: 'Mã đơn hàng',
        cell: (row) => <Text size="sm">{row.getValue() as string}</Text>,
      },
      {
        accessorKey: 'urlCV',
        header: '',
        cell: (row) => (
          <Button.Root size="xs" variant="ghost" href={row.getValue() as string} target="_blank">
            <Button.Icon type="leading">
              <DownloadIcon />
            </Button.Icon>
            <Button.Label>Tải CV</Button.Label>
          </Button.Root>
        ),
      },
    ],
    []
  );

  const items = data?.pages?.map((p) => p.data.result).flat() ?? [];

  const isFilterActive = useMemo(() => {
    if (filter && Object.values(filter).some((v) => v?.length > 0)) {
      return true;
    }

    return false;
  }, [filter]);

  return (
    <div className="space-y-2 mt-8">
      <TopBar
        selectedItems={selectedItems}
        actions={actions}
        onFilterClick={() => setIsFilterPanelOpen(true)}
        isFilterActive={isFilterActive}
        totalItems={data?.pages?.[0].data.meta.total}
      />
      <ResumeTableFilter open={isFilterPanelOpen} onOpenChange={setIsFilterPanelOpen} onSubmit={setFilter} />
      <ResumeDetailPanel open={isDetailPanelOpen} onOpenChange={setIsDetailPanelOpen} item={selectedItems?.[0]} />
      <ResumeUpdateStatusPanel
        open={isUpdateStatusPanelOpen}
        onOpenChange={setIsUpdateStatusPanelOpen}
        item={selectedItems?.[0]}
        onSubmit={(data) => {
          onStatusUpdate(data);
        }}
      />
      <ReassignPanel
        open={tranferPanelOpen}
        onOpenChange={setTranferPanelOpen}
        defaultValues={{
          id: selectedItems?.[0]?._id ?? '',
          staff: '',
        }}
      />
      <DataTable
        data={items}
        columns={columns}
        isLoading={isLoading}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        selectionMode="single"
        onSelectionChange={onSelect}
        getRowId={(row) => row._id}
      />
    </div>
  );
}

export default AdminResume;
