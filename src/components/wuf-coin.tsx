'use client';

import { useState, FormEvent } from 'react';

interface EligibilityData {
	amount: string;
	index: number;
	address: string;
	proof: string[];
}

interface TokenValueData {
	contract: string;
	decimals: number;
	symbol: string;
	id: string;
	usd_price: number;
	system_price: number;
	cmc_id: number;
}

const formatAmount = (amount: string): string => {
	const integerPart = amount.slice(0, -4);
	const formattedIntegerPart = integerPart.replace(
		/\B(?=(\d{3})+(?!\d))/g,
		','
	);
	return `${formattedIntegerPart}`;
};

const EligibilityCheck = () => {
	const [inputValue, setInputValue] = useState<string>('');
	const [wallet, setWallet] = useState<string>('');
	const [fetchData, setFetchData] = useState<EligibilityData | null>(null);
	const [tokenValue, setTokenValue] = useState<TokenValueData | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setWallet(inputValue);
		setLoading(true);
		setFetchData(null);

		try {
			const response = await fetch(
				`https://airdrop-api.wuffi.io/airdrop/check-eligible?chain=wax&id=2&address=${inputValue}`
			);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const data: EligibilityData = await response.json();
			setFetchData(data);

			// Fetch token value
			const tokenResponse = await fetch(
				`https://alcor.exchange/api/v2/tokens/wuf-wuffi`
			);
			if (!tokenResponse.ok) {
				throw new Error('Network response was not ok');
			}
			const tokenData: TokenValueData = await tokenResponse.json();
			setTokenValue(tokenData);
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setLoading(false);
		}
	};

	const calculateTotalValue = (amount: string, price: number): string => {
		const totalAmount = parseFloat(amount) / 10000;
		return (totalAmount * price).toFixed(0);
	};

	return (
		<div className='space-y-6'>
			<form onSubmit={handleSubmit} className='flex flex-col gap-6'>
				<label htmlFor='wallet'>Enter Your wax wallet address</label>
				<input
					id='wallet'
					className='bg-black border p-3 text-white'
					onChange={(e) => setInputValue(e.target.value)}
					value={inputValue}
				/>
				<button
					className='bg-slate-300 p-4 rounded-md text-blue-800 font-bold hover:bg-slate-400 transition-transform ease-linear'
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
						<div className='bg-slate-800 text-white p-4 rounded-md space-y-3'>
							You have got{' '}
							<span className='bolder text-xl text-green-400'>
								{formatAmount(fetchData.amount)}
							</span>{' '}
							coins
							<div>
								Current Value in USD:{' '}
								<span className='bolder text-xl text-green-400'>
									{tokenValue && fetchData
										? `$${calculateTotalValue(
												fetchData.amount,
												tokenValue.usd_price
										  )}`
										: 'Calculating...'}
								</span>
							</div>
							<div>
								Current Value in WAXP:{' '}
								<span className='bolder text-xl text-green-400'>
									{tokenValue && fetchData
										? `${calculateTotalValue(
												fetchData.amount,
												tokenValue.system_price
										  )}`
										: 'Calculating...'}
								</span>
							</div>
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
