import { useState, useEffect } from 'react';
import { ExpirationData } from '@/types/dashboard';

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-007ermh3iidknbbtdmu5vct207mdlbaa.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//04w4V2xMUIMzACgYIARAAGAQSNwF-L9Ir5__pXDmZVYaHKOSqyauTDVmTvrCvgaL2beep4gmp8_lVED0ppM9BPWDDimHyQKk50EY",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = "1rGMDDvvTbZfNg1dueWtRN3LhOgGQOdLg3Fd7Sn1GCZo";

export const useExpirationsData = () => {
  const [data, setData] = useState<ExpirationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async () => {
    try {
      const response = await fetch(GOOGLE_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          client_secret: GOOGLE_CONFIG.CLIENT_SECRET,
          refresh_token: GOOGLE_CONFIG.REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await response.json();
      return tokenData.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  const fetchExpirationsData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching expirations data from Google Sheets...');
      const accessToken = await getAccessToken();
      console.log('Access token obtained successfully');
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Expirations?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch expirations data');
      }

      const result = await response.json();
      const rows = result.values || [];
      
      if (rows.length < 2) {
        setData([]);
        return;
      }

      const headers = rows[0];
      console.log('Sheet headers:', headers);
      
      // Transform the raw data to match ExpirationData interface
      const expirationsData: ExpirationData[] = rows.slice(1).map((row: any[]) => {
        const rawItem: any = {};
        headers.forEach((header: string, index: number) => {
          rawItem[header] = row[index] || '';
        });

        // Transform to match ExpirationData interface with camelCase field names
        const transformedItem: ExpirationData = {
          uniqueId: rawItem['Unique Id'] || rawItem['uniqueId'] || '',
          memberId: rawItem['Member ID'] || rawItem['memberId'] || '',
          firstName: rawItem['First Name'] || rawItem['firstName'] || '',
          lastName: rawItem['Last Name'] || rawItem['lastName'] || '',
          email: rawItem['Email'] || rawItem['email'] || '',
          membershipName: rawItem['Membership Name'] || rawItem['membershipName'] || '',
          endDate: rawItem['End Date'] || rawItem['endDate'] || '',
          homeLocation: rawItem['Home Location'] || rawItem['homeLocation'] || '',
          currentUsage: rawItem['Current Usage'] || rawItem['currentUsage'] || '',
          id: rawItem['Id'] || rawItem['id'] || '',
          orderAt: rawItem['Order At'] || rawItem['orderAt'] || '',
          soldBy: rawItem['Sold By'] || rawItem['soldBy'] || '',
          membershipId: rawItem['Membership Id'] || rawItem['membershipId'] || '',
          frozen: rawItem['Frozen'] === 'TRUE' || rawItem['frozen'] === true,
          paid: rawItem['Paid'] || rawItem['paid'] || '',
          status: rawItem['Status'] || rawItem['status'] || '',
        };

        return transformedItem;
      });

      console.log('Transformed expirations data sample:', expirationsData.slice(0, 3));
      setData(expirationsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching expirations data:', err);
      setError('Failed to load expirations data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpirationsData();
  }, []);

  return { data, loading, error, refetch: fetchExpirationsData };
};