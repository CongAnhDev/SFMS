import { CreateScholarProvSchema } from '@components/schoolar-list/CreateScholarProvPanel';
import { getScholarProvShipKey } from '@components/schoolarprov-list/constant';
import { useUploadBatchImages } from '@components/upload/useUploadBatchImages';
import { useUser } from '@lib/auth';
import axios from '@lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateScholarProvShip() {
  const client = useQueryClient();
  const user = useUser();
  const { mutateAsync } = useUploadBatchImages();
  return useMutation({
    mutationFn: async (data: CreateScholarProvSchema) => {
      const imagesToUpload = data.image.filter((i) => i instanceof File);
      const images = data.image.filter((i) => !(i instanceof File));
      if (imagesToUpload.length > 0) {
        const res = await mutateAsync(imagesToUpload);
        images.push(...res.map((r) => r.url));
      }

      return axios.post('/scholar-prov', {
        ...data,
        image: images,
        provider: user?.provider,
      });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: getScholarProvShipKey.list() });
    },
  });
}
