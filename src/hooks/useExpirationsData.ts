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
      console.log('🔍 Fetching expirations data from Google Sheets API...');
      
      const accessToken = await getAccessToken();
      console.log('✅ Access token obtained successfully');
      
      // Try different possible sheet names
      const possibleSheetNames = ['Expirations', 'Expiration', 'Members', 'Sheet1', 'Data'];
      let response;
      let sheetName = '';
      
      for (const name of possibleSheetNames) {
        try {
          console.log(`🔍 Trying sheet name: ${name}`);
          response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${name}?alt=json`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          
          if (response.ok) {
            sheetName = name;
            console.log(`✅ Successfully found sheet: ${name}`);
            break;
          }
        } catch (sheetError) {
          console.log(`❌ Sheet ${name} not found, trying next...`);
          continue;
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Failed to fetch expirations data from any sheet. Tried: ${possibleSheetNames.join(', ')}`);
      }

      const result = await response.json();
      const rows = result.values || [];
      
      console.log('📊 Received rows:', rows.length);

      if (rows.length < 2) {
        console.log('⚠️ No data rows found');
        setData([]);
        return;
      }

      const headers = rows[0];
      console.log('📋 Headers:', headers);

      // Transform data rows (skip header)
      const expirationsData: ExpirationData[] = [];
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        // Skip empty rows
        if (!row || row.length === 0) continue;
        
        const dataRow: ExpirationData = {
          uniqueId: row[headers.findIndex((h: string) => h === 'Unique Id')] || row[headers.findIndex((h: string) => h === 'UniqueId')] || row[headers.findIndex((h: string) => h === 'ID')] || `exp-${Date.now()}-${i}`,
          memberId: row[headers.findIndex((h: string) => h === 'Member ID')] || row[headers.findIndex((h: string) => h === 'MemberID')] || '',
          firstName: row[headers.findIndex((h: string) => h === 'First Name')] || row[headers.findIndex((h: string) => h === 'FirstName')] || '',
          lastName: row[headers.findIndex((h: string) => h === 'Last Name')] || row[headers.findIndex((h: string) => h === 'LastName')] || '',
          email: row[headers.findIndex((h: string) => h === 'Email')] || '',
          membershipName: row[headers.findIndex((h: string) => h === 'Membership Name')] || row[headers.findIndex((h: string) => h === 'MembershipName')] || '',
          endDate: row[headers.findIndex((h: string) => h === 'End Date')] || row[headers.findIndex((h: string) => h === 'EndDate')] || '',
          homeLocation: row[headers.findIndex((h: string) => h === 'Home Location')] || row[headers.findIndex((h: string) => h === 'HomeLocation')] || '',
          currentUsage: row[headers.findIndex((h: string) => h === 'Current Usage')] || row[headers.findIndex((h: string) => h === 'CurrentUsage')] || '',
          id: row[headers.findIndex((h: string) => h === 'Id')] || row[headers.findIndex((h: string) => h === 'ID')] || '',
          orderAt: row[headers.findIndex((h: string) => h === 'Order At')] || row[headers.findIndex((h: string) => h === 'OrderAt')] || '',
          soldBy: row[headers.findIndex((h: string) => h === 'Sold By')] || row[headers.findIndex((h: string) => h === 'SoldBy')] || '',
          membershipId: row[headers.findIndex((h: string) => h === 'Membership Id')] || row[headers.findIndex((h: string) => h === 'MembershipId')] || '',
          frozen: row[headers.findIndex((h: string) => h === 'Frozen')] === 'TRUE' || row[headers.findIndex((h: string) => h === 'frozen')] === 'true' || false,
          paid: row[headers.findIndex((h: string) => h === 'Paid')] || '',
          status: row[headers.findIndex((h: string) => h === 'Status')] || ''
        };
        
        expirationsData.push(dataRow);
      }

      console.log('✅ Successfully processed:', expirationsData.length, 'expiration records');
      console.log('📝 Sample record:', expirationsData[0]);
      
      setData(expirationsData);
      setError(null);
    } catch (err) {
      console.error('💥 Error fetching expirations data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load expirations data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpirationsData();
  }, []);

  return { 
    data, 
    loading, 
    error: error || '', 
    refetch: fetchExpirationsData
  };
};