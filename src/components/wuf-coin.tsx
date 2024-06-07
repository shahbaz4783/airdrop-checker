'use client';

import { useState, FormEvent } from 'react';

interface EligibilityData {
	amount: string;
	index: number;
	address: string;
	proof: string[];
}

const formatAmount = (amount: string): string => {
	const integerPart = amount.slice(0, -4);
	const decimalPart = amount.slice(-4);
	return `${integerPart}.${decimalPart}`;
};

const EligibilityCheck = () => {
	const [wallet, setWallet] = useState<string>('');
	const [fetchData, setFetchData] = useState<EligibilityData | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setFetchData(null);

		try {
			const response = await fetch(
				`https://airdrop-api.wuffi.io/airdrop/check-eligible?chain=wax&id=2&address=${wallet}`
			);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const data: EligibilityData = await response.json();
			setFetchData(data);
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='space-y-6'>
			<form onSubmit={handleSubmit} className='flex flex-col gap-6'>
				<label htmlFor=''>Enter Your wax wallet address</label>
				<input
					className='bg-black border p-3'
					onChange={(e) => setWallet(e.target.value)}
					value={wallet}
				/>
				<button
					className='bg-slate-300 p-4 rounded-md text-blue-800 font-bold hover:bg-slate-00 transition-transform ease-linear'
					type='submit'
				>
					Check Eligibility
				</button>
			</form>
			{wallet === '' ? (
				''
			) : (
				<div className='mb-4'>
					{loading ? (
						<h1>Loading...</h1>
					) : fetchData?.amount ? (
						<div>
							You have got{' '}
							<span className='bolder text-xl'>
								{formatAmount(fetchData.amount)}
							</span>
						</div>
					) : (
						<p>Address is not eligible for airdrop</p>
					)}
				</div>
			)}
		</div>
	);
};

export default EligibilityCheck;
