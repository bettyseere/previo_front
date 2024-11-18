import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, useQueryClient, QueryKey } from "@tanstack/react-query";

export const useApiGet = <TData = unknown, TError = unknown>(
    key: QueryKey,
    fn: () => Promise<TData>,
    options?: UseQueryOptions<TData, TError>
) => useQuery<TData, TError>({
    queryKey: key,
    queryFn: fn,
    ...options
});



export const useApiSend = <TData = unknown, TError = unknown>(
    fn: () => Promise<TData>,
    success?: (data: TData) => void,
    error?: (err: TError) => void,
    invalidateKey?: QueryKey[],
    options?: UseMutationOptions<TData, TError>
) => {
    const queryClient = useQueryClient();

    return useMutation<TData, TError>({
        mutationFn: fn,
        onSuccess: (data) => {
            if (invalidateKey) {
                invalidateKey.forEach((key) => {
                    // Use the object syntax for invalidateQueries to ensure compatibility
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }
            if (success) success(data);
        },
        onError: error,
        retry: 2,
        ...options
    });
};
