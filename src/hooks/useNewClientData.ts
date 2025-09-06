
import { useState, useEffect } from 'react';
import { NewClientData } from '@/types/dashboard';

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-007ermh3iidknbbtdmu5vct207mdlbaa.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//04pAfj5ZB3ahLCgYIARAAGAQSNwF-L9IrqCo4OyUjAbO1hP5bR3vhs8K96zDZkbeCzcuCjzEiBPZ3O639cLRkUduicMYK1Rzs5GY",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = "149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI";

export const useNewClientData = () => {
  const [data, setData] = useState<NewClientData[]>([]);
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

  // Helper to extract monthYear from a date string (YYYY-MM or MMM YYYY)
  const getMonthYear = (dateStr: string = ''): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  const fetchNewClientData = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/New?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch new client data');
      }

      const result = await response.json();
      const rows = result.values || [];
      
      if (rows.length < 2) {
        setData([]);
        return;
      }

      const newClientData: NewClientData[] = rows.slice(1).map((row: any[]) => {
        const firstVisitDate = row[5] || '';
        return {
          memberId: row[0] || '',
          firstName: row[1] || '',
          lastName: row[2] || '',
          email: row[3] || '',
          phoneNumber: row[4] || '',
          firstVisitDate,
          firstVisitEntityName: row[6] || '',
          firstVisitType: row[7] || '',
          firstVisitLocation: row[8] || '',
          paymentMethod: row[9] || '',
          membershipUsed: row[10] || '',
          homeLocation: row[11] || '',
          classNo: parseFloat(row[12]) || 0,
          trainerName: row[13] || '',
          isNew: row[14] || '',
          visitsPostTrial: parseFloat(row[15]) || 0,
          membershipsBoughtPostTrial: row[16] || '',
          purchaseCountPostTrial: parseFloat(row[17]) || 0,
          ltv: parseFloat(row[18]) || 0,
          retentionStatus: row[19] || '',
          conversionStatus: row[20] || '',
          period: row[21] || '',
          unique: row[22] || '',
          firstPurchase: row[23] || '',
          conversionSpan: parseFloat(row[24]) || 0,
          monthYear: getMonthYear(firstVisitDate),
        };
      });

      console.log('New client data loaded:', newClientData.length, 'records');
      setData(newClientData);
      setError(null);
    } catch (err) {
      console.error('Error fetching new client data:', err);
      setError('Failed to load new client data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewClientData();
  }, []);

  return { data, loading, error, refetch: fetchNewClientData };
};
