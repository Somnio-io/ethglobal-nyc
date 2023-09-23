import { MaxUint256 } from "ethers";
import { useMemo } from "react";
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  erc20ABI,
  erc721ABI,
} from "wagmi";

interface ContractDetails {
  abi: string[];
  address: `0x${string}`;
}

const FEATURE_ENABLE_TIPPING_TOKEN = process.env
  .FEATURE_ENABLED_TIPPING_TOKEN as unknown as boolean;

const FEATURE_ENABLE_TIPPING_TOKEN_ADDRESS = process.env
  .FEATURE_ENABLED_TIPPING_TOKEN_ADDRESS as unknown as `0x${string}`;

export function useContract(
  contractDetails: ContractDetails,
  usersWalletAddress: `0x${string}` | undefined
) {
  // Get the allowance of the payment token
  const {
    data: allowanceOf,
    isLoading: allowanceOfLoading,
    refetch: refetchAllowanceOf,
  } = useContractRead({
    abi: erc20ABI,
    address: FEATURE_ENABLE_TIPPING_TOKEN_ADDRESS,
    enabled: FEATURE_ENABLE_TIPPING_TOKEN,
    functionName: "allowance",
    args: [usersWalletAddress!, FEATURE_ENABLE_TIPPING_TOKEN_ADDRESS],
  });

  // approve spending of the payment token
  const { config: prepareApproveOfPaymentToken } = usePrepareContractWrite({
    abi: erc20ABI,
    address: FEATURE_ENABLE_TIPPING_TOKEN_ADDRESS,
    functionName: "approve",
    enabled: FEATURE_ENABLE_TIPPING_TOKEN,
    args: [contractDetails.address, MaxUint256],
  });

  const {
    data: approvePaymentTokenSpendData,
    write: approvePaymentTokenSpendDataWrite,
  } = useContractWrite(prepareApproveOfPaymentToken);

  const { isLoading: approvePaymentTokenSpendTransaction } =
    useWaitForTransaction({
      hash: approvePaymentTokenSpendData?.hash,
      enabled: FEATURE_ENABLE_TIPPING_TOKEN,
      onSuccess: async () => {
        await refetchAllowanceOf();
      },
    });

  const isLoading = useMemo(() => {
    return [approvePaymentTokenSpendTransaction, allowanceOfLoading].some(
      (loading) => loading
    );
  }, [approvePaymentTokenSpendTransaction, allowanceOfLoading]);

  return {
    isLoading,
    allowanceOf,
    approvePaymentTokenSpendDataWrite,
  };
}
