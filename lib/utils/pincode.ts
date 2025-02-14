export async function getCityFromPincode(pincode: string): Promise<{ city: string; state: string }> {
  try {
    // First try India Post API
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        cache: 'default'
      }
    ).catch(() => null); // Handle network errors gracefully

    if (response?.ok) {
      const data = await response.json();
      if (data?.[0]?.Status === "Success" && data[0]?.PostOffice?.[0]) {
        return {
          city: data[0].PostOffice[0].District,
          state: data[0].PostOffice[0].State
        };
      }
    }

    // If India Post API fails, try backup static data
    const pincodeData = {
      "395004": { city: "Surat", state: "Gujarat" },
      "380001": { city: "Ahmedabad", state: "Gujarat" },
      "400001": { city: "Mumbai", state: "Maharashtra" },
      // Add more pincode mappings as needed
    };

    if (pincodeData[pincode as keyof typeof pincodeData]) {
      return pincodeData[pincode as keyof typeof pincodeData];
    }

    // If both methods fail, try the third API
    const response2 = await fetch(
      `https://api.zippopotam.us/in/${pincode}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        cache: 'default',
      }
    ).catch(() => null);

    if (response2?.ok) {
      const data = await response2.json();
      if (data?.places?.[0]) {
        return {
          city: data.places[0]['place name'],
          state: data.places[0].state
        };
      }
    }

    throw new Error("Could not find location for this pincode");

  } catch (error) {
    console.error('Pincode lookup error:', error);
    throw new Error("Failed to fetch location details");
  }
}

// Validate pincode format
export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode);
}

// Add a function to get state from pincode prefix
export function getStateFromPincodePrefix(pincode: string): string | null {
  const pincodeRanges: { [key: string]: string } = {
    "11": "Delhi",
    "12": "Haryana",
    "13": "Punjab",
    "14": "Punjab",
    "15": "Punjab",
    "16": "Punjab",
    "17": "Himachal Pradesh",
    "18": "Jammu & Kashmir",
    "19": "Jammu & Kashmir",
    "20": "Uttar Pradesh",
    "21": "Uttar Pradesh",
    "22": "Uttar Pradesh",
    "23": "Uttar Pradesh",
    "24": "Uttar Pradesh",
    "25": "Uttar Pradesh",
    "26": "Uttar Pradesh",
    "27": "Uttar Pradesh",
    "28": "Uttar Pradesh",
    "30": "Rajasthan",
    "31": "Rajasthan",
    "32": "Rajasthan",
    "33": "Rajasthan",
    "34": "Rajasthan",
    "36": "Gujarat",
    "37": "Gujarat",
    "38": "Gujarat",
    "39": "Gujarat",
    "40": "Maharashtra",
    "41": "Maharashtra",
    "42": "Maharashtra",
    "43": "Maharashtra",
    "44": "Maharashtra",
  };

  const prefix2 = pincode.substring(0, 2);
  return pincodeRanges[prefix2] || null;
} 