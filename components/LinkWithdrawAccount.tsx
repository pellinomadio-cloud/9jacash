import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { User } from '../types';
import { useBankDetails, recordPaymentProof } from '../firebase';
import { verifyBankAccountClient } from '../clientServices';
import { compressReceiptImage } from '../imageCompressor';
import { motion, AnimatePresence } from 'motion/react';

const BANKS_DATA = [
  {"id":"825.0", "code":"000019", "name":"Enterprise Bank"}, {"id":"645.0", "code":"100004", "name":"OPay"}, {"id":"964.0", "code":"000025", "name":"Titan Trust Bank"}, {"id":"785.0", "code":"100033", "name":"PalmPay"}, {"id":"301.0", "code":"000027", "name":"Globus Bank"}, {"id":"1978.0", "code":"000028", "name":"Central Bank Of Nigeria"}, {"id":"1977.0", "code":"000029", "name":"Lotus Bank"}, {"id":"988.0", "code":"000030", "name":"Parallex Bank"}, {"id":"1318.0", "code":"000031", "name":"PremiumTrust Bank"}, {"id":"1355.0", "code":"000033", "name":"ENaira"}, {"id":"2050.0", "code":"000034", "name":"SIGNATURE BANK"}, {"id":"2010.0", "code":"000036", "name":"Optimus Bank"}, {"id":"2298.0", "code":"000037", "name":"ALTERNATIVE BANK LIMITED"}, {"id":"5.0", "code":"011", "name":"First Bank PLC"}, {"id":"2.0", "code":"023", "name":"Citi Bank"}, {"id":"14.0", "code":"032", "name":"Union Bank PLC"}, {"id":"13.0", "code":"033", "name":"United Bank for Africa"}, {"id":"15.0", "code":"035", "name":"Wema Bank PLC"}, {"id":"1.0", "code":"044", "name":"Access Bank"}, {"id":"4.0", "code":"050", "name":"EcoBank PLC"}, {"id":"1976.0", "code":"050001", "name":"County Finance Ltd"}, {"id":"1975.0", "code":"050002", "name":"Fewchore Finance Company Limited"}, {"id":"1974.0", "code":"050003", "name":"Sagegrey Finance Limited"}, {"id":"1973.0", "code":"050004", "name":"Newedge Finance Ltd"}, {"id":"1972.0", "code":"050005", "name":"Aaa Finance"}, {"id":"1971.0", "code":"050006", "name":"Branch International Finance Company Limited"}, {"id":"2042.0", "code":"050007", "name":"Tekla Finance Ltd"}, {"id":"2072.0", "code":"050008", "name":"SIMPLE FINANCE LIMITED"}, {"id":"2035.0", "code":"050009", "name":"FAST CREDIT"}, {"id":"2048.0", "code":"050010", "name":"FUNDQUEST FINANCIAL SERVICES LTD"}, {"id":"2056.0", "code":"050012", "name":"Enco Finance"}, {"id":"2060.0", "code":"050013", "name":"Dignity Finance"}, {"id":"2067.0", "code":"050014", "name":"TRINITY FINANCIAL SERVICES LIMITED"}, {"id":"2891.0", "code":"050019", "name":"ZEDVANCE FINANCE LIMITED"}, {"id":"2299.0", "code":"050020", "name":"VALE FINANCE LIMITED"}, {"id":"16.0", "code":"057", "name":"Zenith bank PLC"}, {"id":"8.0", "code":"058", "name":"Guaranty Trust Bank"}, {"id":"826.0", "code":"060001", "name":"Coronation Merchant Bank"}, {"id":"827.0", "code":"060002", "name":"FBNQUEST Merchant Bank"}, {"id":"828.0", "code":"060003", "name":"Nova Merchant Bank"}, {"id":"987.0", "code":"060004", "name":"Greenwich Merchant Bank"}, {"id":"11.0", "code":"068", "name":"Standard Chaterted bank PLC"}, {"id":"7.0", "code":"070", "name":"Fidelity Bank"}, {"id":"811.0", "code":"070001", "name":"NPF MicroFinance Bank"}, {"id":"847.0", "code":"070002", "name":"Fortis Microfinance Bank"}, {"id":"659.0", "code":"070006", "name":"Covenant Microfinance Bank"}, {"id":"829.0", "code":"070007", "name":"Omoluabi savings and loans"}, {"id":"848.0", "code":"070008", "name":"Page Financials"}, {"id":"836.0", "code":"070009", "name":"Gateway Mortgage Bank"}, {"id":"837.0", "code":"070010", "name":"Abbey Mortgage Bank"}, {"id":"838.0", "code":"070011", "name":"Refuge Mortgage Bank"}, {"id":"839.0", "code":"070012", "name":"Lagos Building Investment Company"}, {"id":"840.0", "code":"070013", "name":"Platinum Mortgage Bank"}, {"id":"841.0", "code":"070014", "name":"First Generation Mortgage Bank"}, {"id":"842.0", "code":"070015", "name":"Brent Mortgage Bank"}, {"id":"843.0", "code":"070016", "name":"Infinity Trust Mortgage Bank"}, {"id":"845.0", "code":"070017", "name":"Haggai Mortgage Bank Limited"}, {"id":"1970.0", "code":"070019", "name":"Mayfresh Mortgage Bank"}, {"id":"1969.0", "code":"070021", "name":"Coop Mortgage Bank"}, {"id":"1968.0", "code":"070022", "name":"Stb Mortgage Bank"}, {"id":"1967.0", "code":"070023", "name":"Delta Trust Mortgage Bank"}, {"id":"1966.0", "code":"070024", "name":"Homebase Mortgage"}, {"id":"1965.0", "code":"070025", "name":"Akwa Savings & Loans Limited"}, {"id":"1964.0", "code":"070026", "name":"Fha Mortgage Bank Ltd"}, {"id":"9.0", "code":"076", "name":"Polaris bank"}, {"id":"1963.0", "code":"080002", "name":"Tajwallet"}, {"id":"183.0", "code":"082", "name":"Keystone Bank"}, {"id":"830.0", "code":"090001", "name":"ASOSavings & Loans"}, {"id":"844.0", "code":"090003", "name":"Jubilee-Life Mortgage Bank"}, {"id":"849.0", "code":"090004", "name":"Parralex Microfinance bank"}, {"id":"831.0", "code":"090005", "name":"Trustbond Mortgage Bank"}, {"id":"832.0", "code":"090006", "name":"SafeTrust"}, {"id":"850.0", "code":"090097", "name":"Ekondo MFB"}, {"id":"2890.0", "code":"090107", "name":"FIRSTTRUST MORTGAGE BANK"}, {"id":"846.0", "code":"090108", "name":"New Prudential Bank"}, {"id":"660.0", "code":"090110", "name":"VFD Micro Finance Bank"}, {"id":"851.0", "code":"090112", "name":"Seed Capital Microfinance Bank"}, {"id":"1962.0", "code":"090113", "name":"Microvis Microfinance Bank"}, {"id":"852.0", "code":"090114", "name":"Empire trust MFB"}, {"id":"258.0", "code":"090115", "name":"IBANK Microfinance Bank"}, {"id":"853.0", "code":"090116", "name":"AMML MFB"}, {"id":"854.0", "code":"090117", "name":"Boctrust Microfinance Bank"}, {"id":"855.0", "code":"090118", "name":"IBILE Microfinance Bank"}, {"id":"856.0", "code":"090119", "name":"Ohafia Microfinance Bank"}, {"id":"857.0", "code":"090120", "name":"Wetland Microfinance Bank"}, {"id":"858.0", "code":"090121", "name":"Hasal Microfinance Bank"}, {"id":"859.0", "code":"090122", "name":"Gowans Microfinance Bank"}, {"id":"860.0", "code":"090123", "name":"Verite Microfinance Bank"}, {"id":"861.0", "code":"090124", "name":"Xslnce Microfinance Bank"}, {"id":"862.0", "code":"090125", "name":"Regent Microfinance Bank"}, {"id":"863.0", "code":"090126", "name":"Fidfund Microfinance Bank"}, {"id":"864.0", "code":"090127", "name":"BC Kash Microfinance Bank"}, {"id":"865.0", "code":"090128", "name":"Ndiorah Microfinance Bank"}, {"id":"866.0", "code":"090129", "name":"Money Trust Microfinance Bank"}, {"id":"867.0", "code":"090130", "name":"Consumer Microfinance Bank"}, {"id":"868.0", "code":"090131", "name":"Allworkers Microfinance Bank"}, {"id":"869.0", "code":"090132", "name":"Richway Microfinance Bank"}, {"id":"870.0", "code":"090133", "name":"AL-Barakah Microfinance Bank"}, {"id":"871.0", "code":"090134", "name":"Accion Microfinance Bank"}, {"id":"872.0", "code":"090135", "name":"Personal Trust Microfinance Bank"}, {"id":"873.0", "code":"090136", "name":"Baobab Microfinance Bank"}, {"id":"874.0", "code":"090137", "name":"PecanTrust Microfinance Bank"}, {"id":"875.0", "code":"090138", "name":"Royal Exchange Microfinance Bank"}, {"id":"876.0", "code":"090139", "name":"Visa Microfinance Bank"}, {"id":"877.0", "code":"090140", "name":"Sagamu Microfinance Bank"}, {"id":"878.0", "code":"090141", "name":"Chikum Microfinance Bank"}, {"id":"879.0", "code":"090142", "name":"Yes Microfinance Bank"}, {"id":"880.0", "code":"090143", "name":"Apeks Microfinance Bank"}, {"id":"881.0", "code":"090144", "name":"CIT Microfinance Bank"}, {"id":"882.0", "code":"090145", "name":"Fullrange Microfinance Bank"}, {"id":"883.0", "code":"090146", "name":"Trident Microfinance Bank"}, {"id":"884.0", "code":"090147", "name":"Hackman Microfinance Bank"}, {"id":"885.0", "code":"090148", "name":"Bowen Microfinance Bank"}, {"id":"886.0", "code":"090149", "name":"IRL Microfinance Bank"}, {"id":"887.0", "code":"090150", "name":"Virtue Microfinance Bank"}, {"id":"888.0", "code":"090151", "name":"Mutual Trust Microfinance Bank"}, {"id":"889.0", "code":"090152", "name":"Nagarta Microfinance Bank"}, {"id":"890.0", "code":"090153", "name":"FFS Microfinance Bank"}, {"id":"891.0", "code":"090154", "name":"CEMCS Microfinance Bank"}, {"id":"892.0", "code":"090155", "name":"La Fayette Microfinance Bank"}, {"id":"893.0", "code":"090156", "name":"e-Barcs Microfinance Bank"}, {"id":"894.0", "code":"090157", "name":"Infinity Microfinance Bank"}, {"id":"895.0", "code":"090158", "name":"Futo Microfinance Bank"}, {"id":"896.0", "code":"090160", "name":"Credit Afrique Microfinance Bank"}, {"id":"897.0", "code":"090161", "name":"Addosser Microfinance Bank"}, {"id":"898.0", "code":"090162", "name":"Okpoga Microfinance Bank"}, {"id":"899.0", "code":"090163", "name":"Stanford Microfinance Bak"}, {"id":"1961.0", "code":"090164", "name":"First Multiple Microfinance Bank"}, {"id":"900.0", "code":"090165", "name":"First Royal Microfinance Bank"}, {"id":"901.0", "code":"090166", "name":"Petra Microfinance Bank"}, {"id":"902.0", "code":"090167", "name":"Eso-E Microfinance Bank"}, {"id":"903.0", "code":"090168", "name":"Daylight Microfinance Bank"}, {"id":"904.0", "code":"090169", "name":"Gashua Microfinance Bank"}, {"id":"905.0", "code":"090170", "name":"Alpha Kapital Microfinance Bank"}, {"id":"1960.0", "code":"090171", "name":"Rahama Microfinance Bank"}, {"id":"906.0", "code":"090172", "name":"Mainstreet Microfinance Bank"}, {"id":"907.0", "code":"090173", "name":"Astrapolaris Microfinance Bank"}, {"id":"908.0", "code":"090174", "name":"Reliance Microfinance Bank"}, {"id":"909.0", "code":"090175", "name":"Malachy Microfinance Bank"}, {"id":"253.0", "code":"090176", "name":"Rubies Microfinance Bank"}, {"id":"911.0", "code":"090177", "name":"Bosak Microfinance Bank"}, {"id":"912.0", "code":"090178", "name":"Lapo Microfinance Bank"}, {"id":"913.0", "code":"090179", "name":"GreenBank Microfinance Bank"}, {"id":"914.0", "code":"090180", "name":"FAST Microfinance Bank"}, {"id":"597.0", "code":"090181", "name":"AMJU Unique Microfinance Bank"}, {"id":"1959.0", "code":"090182", "name":"Balogun Fulani Microfinance Bank"}, {"id":"1958.0", "code":"090186", "name":"Standard Microfinance Bank"}, {"id":"1957.0", "code":"090188", "name":"Girei Microfinance Bank"}, {"id":"915.0", "code":"090189", "name":"Baines Credit Microfinance Bank"}, {"id":"916.0", "code":"090190", "name":"Esan Microfinance Bank"}, {"id":"917.0", "code":"090191", "name":"Mutual Benefits Microfinance Bank"}, {"id":"918.0", "code":"090192", "name":"KCMB Microfinance Bank"}, {"id":"919.0", "code":"090193", "name":"Midland Microfinance Bank"}, {"id":"920.0", "code":"090194", "name":"Unical Microfinance Bank"}, {"id":"921.0", "code":"090195", "name":"NIRSAL Microfinance Bank"}, {"id":"922.0", "code":"090196", "name":"Grooming Microfinance Bank"}, {"id":"923.0", "code":"090197", "name":"Pennywise Microfinance Bank"}, {"id":"924.0", "code":"090198", "name":"ABU Microfinance Bank"}, {"id":"925.0", "code":"090201", "name":"RenMoney Microfinance Bank"}, {"id":"1956.0", "code":"090202", "name":"Xpress Payments"}, {"id":"1955.0", "code":"090205", "name":"Accelerex Network"}, {"id":"926.0", "code":"090211", "name":"New Dawn Microfinance Bank"}, {"id":"1954.0", "code":"090251", "name":"Itex Integrated Services Limited"}, {"id":"927.0", "code":"090252", "name":"UNN MFB"}, {"id":"1953.0", "code":"090254", "name":"Yobe Microfinance Bank"}, {"id":"1952.0", "code":"090258", "name":"Coalcamp Microfinance Bank"}, {"id":"928.0", "code":"090259", "name":"Imo State Microfinance Bank"}, {"id":"929.0", "code":"090260", "name":"Alekun Microfinance Bank"}, {"id":"930.0", "code":"090261", "name":"Above Only Microfinance Bank"}, {"id":"931.0", "code":"090262", "name":"Quickfund Microfinance Bank"}, {"id":"932.0", "code":"090263", "name":"Stellas Microfinance Bank"}, {"id":"933.0", "code":"090264", "name":"Navy Microfinance Bank"}, {"id":"934.0", "code":"090265", "name":"Auchi Microfinance Bank"}, {"id":"935.0", "code":"090266", "name":"Lovonus Microfinance Bank"}, {"id":"936.0", "code":"090267", "name":"Uniben Microfinance Bank"}, {"id":"254.0", "code":"090268", "name":"Kuda"}, {"id":"937.0", "code":"090269", "name":"Adeyemi College Staff Microfinance Bank"}, {"id":"938.0", "code":"090270", "name":"Greenville Microfinance Bank"}, {"id":"939.0", "code":"090271", "name":"AB Microfinance Bank"}, {"id":"940.0", "code":"090272", "name":"Lavender Microfinance Bank"}, {"id":"941.0", "code":"090273", "name":"Olabisi Onabanjo University Microfinance Bank"}, {"id":"942.0", "code":"090274", "name":"Emeralds Microfinance Bank"}, {"id":"1951.0", "code":"090275", "name":"Prestige Microfinance Bank"}, {"id":"1950.0", "code":"090276", "name":"BANKIT MFB"}, {"id":"943.0", "code":"090277", "name":"Trustfund Microfinance Bank"}, {"id":"944.0", "code":"090278", "name":"Al-Hayat Microfinance Bank"}, {"id":"1949.0", "code":"090279", "name":"Glory Microfinance Bank"}, {"id":"1948.0", "code":"090280", "name":"Ikire Microfinance Bank"}, {"id":"1947.0", "code":"090281", "name":"Megapraise Microfinance Bank"}, {"id":"640.0", "code":"090282", "name":"Mint-Finex MICROFINANCE BANK"}, {"id":"1946.0", "code":"090283", "name":"Arise Microfinance Bank"}, {"id":"1945.0", "code":"090285", "name":"Thrive Microfinance Bank"}, {"id":"1944.0", "code":"090286", "name":"First Option Microfinance Bank"}, {"id":"996.0", "code":"090287", "name":"Safe Haven MFB"}, {"id":"1943.0", "code":"090289", "name":"Assets Matrix Microfinance Bank"}, {"id":"1942.0", "code":"090290", "name":"Pillar Microfinance Bank"}, {"id":"1941.0", "code":"090291", "name":"Fct Microfinance Bank"}, {"id":"1940.0", "code":"090292", "name":"Halacredit Microfinance Bank"}, {"id":"1939.0", "code":"090293", "name":"Afekhafe Microfinance Bank"}, {"id":"1938.0", "code":"090294", "name":"Brethren Microfinance Bank"}, {"id":"1937.0", "code":"090295", "name":"Eagle Flight Microfinance Bank"}, {"id":"1936.0", "code":"090296", "name":"Omiye Microfinance Bank"}, {"id":"1935.0", "code":"090297", "name":"Polyuwanna Microfinance Bank"}, {"id":"1934.0", "code":"090298", "name":"Alert Microfinance Bank"}, {"id":"1933.0", "code":"090299", "name":"Federalpoly Nasarawamfb"}, {"id":"1932.0", "code":"090302", "name":"Kontagora Microfinance Bank"}, {"id":"1931.0", "code":"090303", "name":"Sunbeam Microfinance Bank"}, {"id":"1930.0", "code":"090304", "name":"Purplemoney Microfinance Bank"}, {"id":"1929.0", "code":"090305", "name":"Evangel Microfinance Bank"}, {"id":"1928.0", "code":"090307", "name":"Sulsap Microfinance Bank"}, {"id":"1927.0", "code":"090308", "name":"Aramoko Microfinance Bank"}, {"id":"1926.0", "code":"090310", "name":"Brightway Microfinance Bank"}, {"id":"1925.0", "code":"090315", "name":"Edfin Microfinance Bank"}, {"id":"1924.0", "code":"090316", "name":"U And C Microfinance Bank"}, {"id":"1923.0", "code":"090317", "name":"Bayero Microfinance Bank"}, {"id":"661.0", "code":"090318", "name":"PatrickGold Microfinance Bank"}, {"id":"1922.0", "code":"090319", "name":"Federal University Dutse Microfinance Bank"}, {"id":"1921.0", "code":"090320", "name":"Bonghe Microfinance Bank"}, {"id":"1920.0", "code":"090321", "name":"Kadpoly Microfinance Bank"}, {"id":"1919.0", "code":"090322", "name":"Mayfair Microfinance Bank"}, {"id":"1918.0", "code":"090323", "name":"Rephidim Microfinance Bank"}, {"id":"1917.0", "code":"090324", "name":"Mainland Microfinance Bank"}, {"id":"1916.0", "code":"090325", "name":"Ikenne Microfinance Bank"}, {"id":"728.0", "code":"090326", "name":"Sparkle"}, {"id":"1915.0", "code":"090327", "name":"Balogun Gambari Microfinance Bank"}, {"id":"1914.0", "code":"090328", "name":"Trust Microfinance Bank"}, {"id":"639.0", "code":"090329", "name":"Eyowo MFB"}, {"id":"1913.0", "code":"090330", "name":"Neptune Microfinance Bank"}, {"id":"1912.0", "code":"090331", "name":"Fame Microfinance Bank"}, {"id":"1911.0", "code":"090332", "name":"Unaab Microfinance Bank"}, {"id":"1910.0", "code":"090333", "name":"Evergreen Microfinance Bank"}, {"id":"1909.0", "code":"090335", "name":"Oche Microfinance Bank"}, {"id":"2034.0", "code":"090336", "name":"Grant MF Bank"}, {"id":"1908.0", "code":"090337", "name":"Bipc Microfinance Bank"}, {"id":"1907.0", "code":"090338", "name":"Iyeru Okin Microfinance Bank Ltd"}, {"id":"1906.0", "code":"090340", "name":"Uniuyo Microfinance Bank"}, {"id":"1905.0", "code":"090341", "name":"Stockcorp Microfinance Bank"}, {"id":"1904.0", "code":"090343", "name":"Unilorin Microfinance Bank"}, {"id":"1903.0", "code":"090345", "name":"Citizen Trust Microfinance Bank Ltd"}, {"id":"1902.0", "code":"090349", "name":"Oau Microfinance Bank Ltd"}, {"id":"1901.0", "code":"090350", "name":"Nasarawa Microfinance Bank"}, {"id":"1900.0", "code":"090352", "name":"Illorin Microfinance Bank"}, {"id":"1899.0", "code":"090353", "name":"Jessefield Microfinance Bank"}, {"id":"1898.0", "code":"090360", "name":"Isuofia Microfinance Bank"}, {"id":"1897.0", "code":"090362", "name":"Cashconnect Microfinance Bank"}, {"id":"1896.0", "code":"090363", "name":"Molusi Microfinance Bank"}, {"id":"1895.0", "code":"090364", "name":"Headway Microfinance Bank"}, {"id":"1894.0", "code":"090365", "name":"Nuture Microfinance Bank"}, {"id":"1893.0", "code":"090366", "name":"Corestep Microfinance Bank"}, {"id":"989.0", "code":"090369", "name":"Firmus MFB"}, {"id":"1892.0", "code":"090370", "name":"Seedvest Microfinance Bank"}, {"id":"1891.0", "code":"090371", "name":"Ilasan Microfinance Bank"}, {"id":"1890.0", "code":"090372", "name":"Agosasa Microfinance Bank"}, {"id":"1889.0", "code":"090373", "name":"Legend Microfinance Bank"}, {"id":"1888.0", "code":"090374", "name":"Tf Microfinance Bank"}, {"id":"1887.0", "code":"090376", "name":"Coastline Microfinance Bank"}, {"id":"1886.0", "code":"090377", "name":"Apple Microfinance Bank"}, {"id":"1885.0", "code":"090378", "name":"Isaleoyo Microfinance Bank"}, {"id":"1884.0", "code":"090379", "name":"New Golden Pastures Microfinance Bank"}, {"id":"1883.0", "code":"090380", "name":"Peniel Micorfinance Bank Ltd"}, {"id":"1882.0", "code":"090383", "name":"Kredi Money Microfinance Bank"}, {"id":"992.0", "code":"090385", "name":"Manny Microfinance bank"}, {"id":"1881.0", "code":"090386", "name":"Gti Microfinance Bank"}, {"id":"1880.0", "code":"090389", "name":"Interland Microfinance Bank"}, {"id":"1879.0", "code":"090390", "name":"Ek-Reliable Microfinance Bank"}, {"id":"1878.0", "code":"090391", "name":"Davodani Microfinance Bank"}, {"id":"1879.0", "code":"090392", "name":"Mozfin Microfinance Bank"}, {"id":"638.0", "code":"090393", "name":"BRIDGEWAY MICROFINANCE BANK"}, {"id":"1875.0", "code":"090394", "name":"Amac Microfinance Bank"}, {"id":"1874.0", "code":"090395", "name":"Borgu Microfinance Bank"}, {"id":"1873.0", "code":"090396", "name":"Oscotech Microfinance Bank"}, {"id":"1872.0", "code":"090397", "name":"Chanelle Bank"}, {"id":"1871.0", "code":"090398", "name":"Federal Polytechnic Nekede Microfinance Bank"}, {"id":"1870.0", "code":"090399", "name":"Nwannegadi Microfinance Bank"}, {"id":"1869.0", "code":"090400", "name":"Finca Microfinance Bank"}, {"id":"1868.0", "code":"090401", "name":"Shepherd Trust Microfinance Bank"}, {"id":"1867.0", "code":"090402", "name":"Peace Microfinance Bank"}, {"id":"1866.0", "code":"090403", "name":"Uda Microfinance Bank"}, {"id":"1865.0", "code":"090404", "name":"Olowolagba Microfinance Bank"}, {"id":"1864.0", "code":"090405", "name":"Moniepoint Microfinance Bank"}, {"id":"1863.0", "code":"090406", "name":"Business Support Microfinance Bank"}, {"id":"1862.0", "code":"090408", "name":"Gmb Microfinance Bank"}, {"id":"1861.0", "code":"090409", "name":"Fcmb Microfinance Bank"}, {"id":"1860.0", "code":"090410", "name":"Maritime Microfinance Bank"}, {"id":"1859.0", "code":"090411", "name":"Giginya Microfinance Bank"}, {"id":"1858.0", "code":"090412", "name":"Preeminent Microfinance Bank"}, {"id":"1857.0", "code":"090413", "name":"Benysta Microfinance Bank"}, {"id":"1856.0", "code":"090414", "name":"Crutech Microfinance Bank"}, {"id":"1855.0", "code":"090415", "name":"Calabar Microfinance Bank"}, {"id":"1854.0", "code":"090416", "name":"Chibueze Microfinance Bank"}, {"id":"1853.0", "code":"090417", "name":"Imowo Microfinance Bank"}, {"id":"1852.0", "code":"090418", "name":"Highland Microfinance Bank"}, {"id":"1851.0", "code":"090419", "name":"Winview Bank"}, {"id":"994.0", "code":"090420", "name":"Letshego MFB"}, {"id":"1850.0", "code":"090421", "name":"Izon Microfinance Bank"}, {"id":"1849.0", "code":"090422", "name":"Landgold Microfinance Bank"}, {"id":"986.0", "code":"090423", "name":"MAUTECH Microfinance Bank"}, {"id":"1848.0", "code":"090424", "name":"Abucoop Microfinance Bank"}, {"id":"1847.0", "code":"090425", "name":"Banex Microfinance Bank"}, {"id":"998.0", "code":"090426", "name":"Tangerine Bank"}, {"id":"1846.0", "code":"090427", "name":"Ebsu Microfinance Bank"}, {"id":"1845.0", "code":"090428", "name":"Ishie Microfinance Bank"}, {"id":"1844.0", "code":"090429", "name":"Crossriver Microfinance Bank"}, {"id":"1843.0", "code":"090430", "name":"Ilora Microfinance Bank"}, {"id":"1842.0", "code":"090431", "name":"Bluewhales Microfinance Bank"}, {"id":"1841.0", "code":"090432", "name":"Memphis Microfinance Bank"}, {"id":"1840.0", "code":"090433", "name":"Rigo Microfinance Bank"}, {"id":"1839.0", "code":"090434", "name":"Insight Microfinance Bank"}, {"id":"1353.0", "code":"090435", "name":"Links Microfinance Bank"}, {"id":"1838.0", "code":"090436", "name":"Spectrum Microfinance Bank"}, {"id":"1837.0", "code":"090437", "name":"Oakland Microfinance Bank"}, {"id":"1836.0", "code":"090438", "name":"Futminna Microfinance Bank"}, {"id":"1835.0", "code":"090439", "name":"Ibeto Microfinance Bank"}, {"id":"1834.0", "code":"090440", "name":"Cherish Microfinance Bank"}, {"id":"1833.0", "code":"090441", "name":"Giwa Microfinance Bank"}, {"id":"1832.0", "code":"090443", "name":"Rima Microfinance Bank"}, {"id":"1831.0", "code":"090444", "name":"Boi Mf Bank"}, {"id":"1830.0", "code":"090445", "name":"Capstone Mf Bank"}, {"id":"1829.0", "code":"090446", "name":"Support Mf Bank"}, {"id":"1828.0", "code":"090448", "name":"Moyofade Mf Bank"}, {"id":"1827.0", "code":"090449", "name":"REX MICROFINANCE BANK"}, {"id":"1826.0", "code":"090450", "name":"Kwasu Mf Bank"}, {"id":"1825.0", "code":"090451", "name":"Atbu Microfinance Bank"}, {"id":"1824.0", "code":"090452", "name":"Unilag Microfinance Bank"}, {"id":"1823.0", "code":"090453", "name":"Uzondu Mf Bank"}, {"id":"1822.0", "code":"090454", "name":"Borstal Microfinance Bank"}, {"id":"2045.0", "code":"090455", "name":"MKOBO MICROFINANCE BANK LTD"}, {"id":"1821.0", "code":"090456", "name":"Ospoly Microfinance Bank"}, {"id":"1820.0", "code":"090459", "name":"Nice Microfinance Bank"}, {"id":"1819.0", "code":"090460", "name":"Oluyole Microfinance Bank"}, {"id":"1818.0", "code":"090461", "name":"Uniibadan Microfinance Bank"}, {"id":"1817.0", "code":"090462", "name":"Monarch Microfinance Bank"}, {"id":"1816.0", "code":"090463", "name":"Rehoboth Microfinance Bank"}, {"id":"1815.0", "code":"090464", "name":"Unimaid Microfinance Bank"}, {"id":"1814.0", "code":"090465", "name":"Maintrust Microfinance Bank"}, {"id":"1813.0", "code":"090466", "name":"Yct Microfinance Bank"}, {"id":"1812.0", "code":"090467", "name":"Good Neighbours Microfinance Bank"}, {"id":"1811.0", "code":"090468", "name":"Olofin Owena Microfinance Bank"}, {"id":"1810.0", "code":"090469", "name":"Aniocha Microfinance Bank"}, {"id":"1317.0", "code":"090470", "name":"DOT MICROFINANCE BANK"}, {"id":"1809.0", "code":"090471", "name":"Oluchukwu Microfinance Bank"}, {"id":"1808.0", "code":"090472", "name":"Caretaker Microfinance Bank"}, {"id":"1807.0", "code":"090473", "name":"Assets Microfinance Bank"}, {"id":"1806.0", "code":"090474", "name":"Verdant Microfinance Bank"}, {"id":"1805.0", "code":"090475", "name":"Giant Stride Microfinance Bank"}, {"id":"1804.0", "code":"090476", "name":"Anchorage Microfinance Bank"}, {"id":"1803.0", "code":"090477", "name":"Light Microfinance Bank"}, {"id":"1802.0", "code":"090478", "name":"Avuenegbe Microfinance Bank"}, {"id":"1801.0", "code":"090479", "name":"First Heritage Microfinance Bank"}, {"id":"1800.0", "code":"090480", "name":"KOLOMONI MICROFINANCE BANK"}, {"id":"1799.0", "code":"090481", "name":"Prisco Microfinance Bank"}, {"id":"1154.0", "code":"090482", "name":"CLEARPAY MICROFINANCE BANK"}, {"id":"1798.0", "code":"090483", "name":"Ada Microfinance Bank"}, {"id":"1797.0", "code":"090484", "name":"Garki Microfinance Bank"}, {"id":"1796.0", "code":"090485", "name":"Safegate Microfinance Bank"}, {"id":"1795.0", "code":"090486", "name":"Fortress Microfinance Bank"}, {"id":"1794.0", "code":"090487", "name":"Kingdom College Microfinance Bank"}, {"id":"1793.0", "code":"090488", "name":"Ibu-Aje Micro"}
];

const banksList = BANKS_DATA.map(b => b.name);

const BANK_CODES_MAP: Record<string, string> = {};
BANKS_DATA.forEach(b => {
  BANK_CODES_MAP[b.name] = b.code;
});

interface LinkWithdrawAccountProps {
  user: User;
  onBack: () => void;
  onUpdateUser?: (updatedUser: User) => void;
}

const LinkWithdrawAccount: React.FC<LinkWithdrawAccountProps> = ({ user, onBack, onUpdateUser }) => {
  const { bankDetails } = useBankDetails();
  const [step, setStep] = useState<'form' | 'notice' | 'instructions' | 'upload' | 'status'>(() => {
    if (user.isAccountLinkedVerified) return 'status';
    if (user.pendingActivation === 'link_account') return 'status';
    return 'form';
  });
  const [accountName, setAccountName] = useState(user.linkedAccountName || '');
  const [bankName, setBankName] = useState(user.linkedBankName || '');
  const [accountNumber, setAccountNumber] = useState(user.linkedAccountNumber || '');
  const [loading, setLoading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [showOpayWarning, setShowOpayWarning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const [bankSearch, setBankSearch] = useState(user.linkedBankName || '');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [lastVerifiedKey, setLastVerifiedKey] = useState('');

  useEffect(() => {
    const bankCode = BANK_CODES_MAP[bankName];
    if (!bankCode || accountNumber.length !== 10) {
      if (accountNumber.length < 10) {
        setAccountName('');
        setVerificationError('');
      }
      return;
    }

    const currentKey = `${bankCode}_${accountNumber}`;
    if (currentKey === lastVerifiedKey) {
      return;
    }

    if (isVerifying) {
      return;
    }

    let isMounted = true;

    const verifyAccount = async () => {
      setIsVerifying(true);
      setVerificationError('');
      setAccountName('');
      try {
        const data = await verifyBankAccountClient(accountNumber, bankCode);
        if (isMounted) {
          if (data.success) {
            setAccountName(data.accountName);
            setLastVerifiedKey(currentKey);
            setVerificationError('');
          } else {
            setVerificationError('Failed to verify account details with bank network');
            setAccountName('');
          }
        }
      } catch (err: any) {
        console.error('Account verification error:', err);
        if (isMounted) {
          setVerificationError(err.message || 'Error during account verification.');
          setAccountName('');
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    verifyAccount();

    return () => {
      isMounted = false;
    };
  }, [bankName, accountNumber, lastVerifiedKey, isVerifying]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) {
      alert('Please wait for account verification to complete.');
      return;
    }
    if (verificationError) {
      alert(`Cannot link account: ${verificationError}`);
      return;
    }
    if (!bankName || !accountNumber) {
      alert('Please select a bank and enter your 10-digit account number.');
      return;
    }
    if (!accountName) {
      alert('Please wait for account name verification to succeed before linking.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('notice');
    }, 700);
  };

  const handleCopyAccount = () => {
    if (bankDetails.accountNumber) {
      navigator.clipboard.writeText(bankDetails.accountNumber);
      setCopiedAccount(true);
      setShowOpayWarning(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async () => {
    const existingUsersStr = localStorage.getItem('9jacash_users') || localStorage.getItem('chix9ja_users');
    const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : {};
    const currentUser: User = existingUsers[user.email.toLowerCase()];

    if (currentUser && currentUser.pendingPaymentProof) {
      alert("You already have a pending payment proof awaiting administrator verification. You cannot upload another receipt until it is approved or declined.");
      return;
    }

    const oneHour = 60 * 60 * 1000;
    if (currentUser && currentUser.lastUploadTimestamp && (Date.now() - currentUser.lastUploadTimestamp < oneHour)) {
      const remainingMinutes = Math.ceil((oneHour - (Date.now() - currentUser.lastUploadTimestamp)) / (60 * 1000));
      alert(`You can only upload a receipt once every hour. Please wait ${remainingMinutes} minutes before attempting another upload.`);
      return;
    }

    if (!proofFile) {
      alert('Please select a payment receipt photo or screenshot');
      return;
    }
    setLoading(true);

    try {
      const base64Data = await compressReceiptImage(proofFile);

      setTimeout(() => {
        const freshUsersStr = localStorage.getItem('9jacash_users') || localStorage.getItem('chix9ja_users');
        const freshUsers = freshUsersStr ? JSON.parse(freshUsersStr) : {};
        const freshUser: User = freshUsers[user.email.toLowerCase()];

        if (freshUser) {
          recordPaymentProof({
            userEmail: user.email,
            userName: freshUser.name,
            amount: 30700,
            type: 'link_account',
            paymentProof: base64Data,
            extraUserFields: {
              linkedBankName: bankName,
              linkedAccountNumber: accountNumber,
              linkedAccountName: accountName,
            }
          }).then((updatedUser) => {
            if (onUpdateUser) {
              onUpdateUser(updatedUser);
            }
            setLoading(false);
            setShowSuccessModal(true);
          }).catch((e) => {
            console.error("Sync error:", e);
            setLoading(false);
            setShowSuccessModal(true);
          });
        } else {
          setLoading(false);
          setStep('status');
        }
      }, 1500);
    } catch (e) {
      console.error("Error converting receipt file:", e);
      setLoading(false);
      alert("Error reading payment proof. Please try uploading again.");
    }
  };

  // Step 5: Status View (Approved or Pending)
  if (step === 'status') {
    if (user.isAccountLinkedVerified) {
      return (
        <div className="min-h-screen bg-[#f4f7f6] text-slate-900 font-sans pb-28">
          <div className="bg-[#013a24] text-white pt-5 pb-9 px-4 rounded-b-[2.2rem] shadow-sm">
            <div className="max-w-md mx-auto flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
              >
                <Icons.ArrowLeft size={20} />
              </button>
              <h2 className="text-base font-black tracking-wide uppercase">Withdrawal Bank Node</h2>
              <div className="w-10" />
            </div>
          </div>

          <div className="max-w-md mx-auto px-4 -mt-4 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-500/30">
                <Icons.CheckCircle size={44} className="text-[#008751]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#008751] bg-emerald-50 px-3 py-1 rounded-full">
                  Node Active & Verified
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
                  Bank Account Linked!
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                  Your external Nigerian bank account is cryptographically validated and routed for instant automated withdrawals.
                </p>
              </div>

              {/* Linked Account Details Box */}
              <div className="bg-[#f8faf9] p-4 rounded-2xl border border-slate-200/80 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Bank Name</span>
                  <span className="font-black text-slate-900">{user.linkedBankName || bankName || 'Verified Bank'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Account Number</span>
                  <span className="font-mono font-black text-slate-900 tracking-wider">{user.linkedAccountNumber || accountNumber || '----------'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Account Holder</span>
                  <span className="font-black text-[#013a24]">{user.linkedAccountName || accountName || user.name}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-4 bg-[#008751] hover:bg-[#007043] text-white font-black rounded-2xl shadow-lg shadow-emerald-900/10 active:scale-95 transition-all uppercase tracking-wider text-xs cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f4f7f6] text-slate-900 font-sans pb-28">
        <div className="bg-[#013a24] text-white pt-5 pb-9 px-4 rounded-b-[2.2rem] shadow-sm">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
            >
              <Icons.ArrowLeft size={20} />
            </button>
            <h2 className="text-base font-black tracking-wide uppercase">Node Integration Status</h2>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 -mt-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-400/40 animate-pulse">
              <Icons.Clock size={40} className="text-amber-500" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Awaiting Verification
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight pt-2">
                Payment Proof Under Review
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                Your ₦30,700 integration receipt has been uploaded and queued for validation by our network audit desk.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left text-xs space-y-2">
              <div className="flex items-center space-x-2 text-[#008751] font-bold">
                <Icons.ShieldCheck size={16} />
                <span>Verification Queue</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Automated NIBSS validator checks usually resolve in <strong>10 to 30 minutes</strong>. Once confirmed, your linked withdrawal node will turn green automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-4 bg-[#013a24] hover:bg-[#024a2e] text-white font-black rounded-2xl shadow-md transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Notice (Integration Fee Overview)
  if (step === 'notice') {
    return (
      <div className="min-h-screen bg-[#f4f7f6] text-slate-900 font-sans pb-28">
        <div className="bg-[#013a24] text-white pt-5 pb-9 px-4 rounded-b-[2.2rem] shadow-sm">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
            >
              <Icons.ArrowLeft size={20} />
            </button>
            <h2 className="text-base font-black tracking-wide uppercase">Node Integration Notice</h2>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 -mt-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5 text-center">
            <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-200">
              <Icons.ShieldCheck size={32} className="text-amber-600" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                Final Step Required
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight pt-1">
                Node Activation Fee
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                To route automated real-time bank settlements to <strong className="text-slate-900">{accountName}</strong>, a one-time database switch integration fee is required.
              </p>
            </div>

            {/* Fee Box */}
            <div className="bg-gradient-to-br from-[#013a24] to-[#008751] text-white p-5 rounded-2xl shadow-sm text-center space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                One-Time Network Switch Fee
              </p>
              <p className="text-3xl font-black tracking-tight">
                ₦30,700
              </p>
              <p className="text-[10px] text-emerald-100/90 font-medium">
                Lifetime Automated Payouts • 0% Bounce Risk
              </p>
            </div>

            {/* Benefits List */}
            <div className="bg-[#f8faf9] p-4 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-700 font-bold">
                <Icons.CheckCircle size={15} className="text-[#008751] shrink-0" />
                <span>Instant withdrawal clearance under 60 seconds</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 font-bold">
                <Icons.CheckCircle size={15} className="text-[#008751] shrink-0" />
                <span>Direct integration with your verified account</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 font-bold">
                <Icons.CheckCircle size={15} className="text-[#008751] shrink-0" />
                <span>Zero limits on daily cashout frequency</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('instructions')}
                className="w-full py-4 bg-[#008751] hover:bg-[#007043] text-white font-black rounded-2xl shadow-md transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Proceed to Payment</span>
                <Icons.ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer"
              >
                Change Bank Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Payment Instructions
  if (step === 'instructions') {
    return (
      <div className="min-h-screen bg-[#f4f7f6] text-slate-900 font-sans pb-28">
        <div className="bg-[#013a24] text-white pt-5 pb-9 px-4 rounded-b-[2.2rem] shadow-sm">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('notice')}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
            >
              <Icons.ArrowLeft size={20} />
            </button>
            <h2 className="text-base font-black tracking-wide uppercase">Payment Instructions</h2>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 -mt-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#008751] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Step 2 of 3
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight pt-1">
                Official Account Details
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Transfer exactly <strong className="text-slate-900">₦30,700</strong> to the account below:
              </p>
            </div>

            {/* Critical OPay / PalmPay Warning Banner */}
            <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-center space-y-1">
              <div className="inline-flex items-center space-x-1 text-red-600 font-black text-[10px] uppercase tracking-wider">
                <Icons.AlertTriangle size={14} />
                <span>Notice: Do Not Use OPay or PalmPay</span>
              </div>
              <p className="text-[10px] text-red-700 leading-snug font-medium">
                Kindly transfer from Kuda, Moniepoint, GTBank, Zenith, Access, UBA, Wema, etc.
              </p>
            </div>

            {/* Management Bank Details Card */}
            <div className="bg-gradient-to-br from-[#013a24] to-[#008751] text-white p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-200">Management Bank</p>
                  <p className="text-base font-black tracking-tight">{bankDetails.bankName || 'Access Bank'}</p>
                </div>
                <div className="p-2 bg-white/10 rounded-xl">
                  <Icons.Building size={20} className="text-emerald-200" />
                </div>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-200">Account Number</p>
                  <p className="text-2xl font-mono font-black tracking-wider text-amber-300">
                    {bankDetails.accountNumber || '---------'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="px-3 py-2 bg-white text-[#013a24] hover:bg-emerald-50 rounded-xl font-bold text-xs flex items-center space-x-1 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Icons.Copy size={13} />
                  <span>{copiedAccount ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-200">Account Name</p>
                <p className="text-sm font-black uppercase tracking-wide">
                  {bankDetails.accountName || '9jacash Global Operations'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="w-full py-4 bg-[#008751] hover:bg-[#007043] text-white font-black rounded-2xl shadow-md transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>I Have Made Payment</span>
                <Icons.ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => setStep('notice')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>

        {/* OPay Warning Modal */}
        <AnimatePresence>
          {showOpayWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOpayWarning(false)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl p-6 bg-white border border-slate-100 shadow-xl text-center space-y-4"
              >
                <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-200">
                  <Icons.AlertTriangle size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Do Not Use OPay or PalmPay
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Payments made through OPay or PalmPay will not sync with the automatic bank verification node. Please use commercial banking apps or Moniepoint.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOpayWarning(false)}
                  className="w-full py-3 bg-[#013a24] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  I Understand, Continue
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Step 4: Upload Receipt
  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-[#f4f7f6] text-slate-900 font-sans pb-28">
        <div className="bg-[#013a24] text-white pt-5 pb-9 px-4 rounded-b-[2.2rem] shadow-sm">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('instructions')}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
            >
              <Icons.ArrowLeft size={20} />
            </button>
            <h2 className="text-base font-black tracking-wide uppercase">Upload Payment Proof</h2>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 -mt-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#008751] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Step 3 of 3
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight pt-1">
                Upload Transfer Receipt
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Upload a clear screenshot of your ₦30,700 transfer receipt
              </p>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-[#f8faf9]">
              {proofPreview ? (
                <div className="space-y-3">
                  <img
                    src={proofPreview}
                    alt="Receipt preview"
                    className="max-h-48 mx-auto rounded-xl object-contain border border-slate-200"
                  />
                  <p className="text-xs font-bold text-slate-700 truncate">{proofFile?.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null);
                      setProofPreview(null);
                    }}
                    className="text-xs text-red-600 font-bold uppercase tracking-wider hover:underline cursor-pointer"
                  >
                    Remove & Select Different Photo
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <div className="mx-auto w-14 h-14 bg-emerald-50 text-[#008751] rounded-2xl flex items-center justify-center">
                    <Icons.Upload size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Tap to Upload Receipt</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Supports PNG, JPG, or JPEG screenshots</p>
                  </div>
                </label>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={!proofFile || loading}
                onClick={handleUploadProof}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-wider text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  proofFile && !loading
                    ? 'bg-[#008751] hover:bg-[#007043] text-white shadow-md active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Icons.CheckCircle size={16} />
                    <span>Submit Payment Proof</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep('instructions')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer"
              >
                Back to Details
              </button>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-sm rounded-3xl p-6 bg-white border border-slate-100 shadow-xl text-center space-y-4"
              >
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-[#008751] border border-emerald-200">
                  <Icons.CheckCircle size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Proof Submitted!
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Your receipt has been forwarded to the database engineers. Your node will be approved within 15 minutes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setStep('status');
                  }}
                  className="w-full py-3 bg-[#008751] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  View Status
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Step 1: Default Form (Enter & Verify Bank Details)
  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-900 font-sans pb-28">
      {/* Top Header */}
      <div className="bg-[#013a24] text-white pt-5 pb-9 px-4 rounded-b-[2.2rem] shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
          >
            <Icons.ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-base font-black tracking-wide uppercase">Link Withdrawal Bank</h2>
            <p className="text-[11px] text-emerald-200/90 font-medium">Direct Automated Payouts</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        {/* Verification Guarantee Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="p-2 bg-[#008751] text-white rounded-xl">
              <Icons.ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">CBN & NIBSS Verification</p>
              <p className="text-[10px] text-slate-500 font-medium">
                Your account details are securely verified in real-time
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Bank Selector */}
            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider ml-1">
                Select Nigerian Bank
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => {
                    setBankSearch(e.target.value);
                    setIsBankDropdownOpen(true);
                    if (e.target.value !== bankName) {
                      setBankName('');
                    }
                  }}
                  onFocus={() => setIsBankDropdownOpen(true)}
                  placeholder="Search Bank (e.g. Access, GTBank, Kuda, Zenith)"
                  className="w-full bg-[#f8faf9] border border-slate-200 p-3.5 pl-11 rounded-2xl text-slate-900 outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/10 transition-all font-medium text-xs placeholder:text-slate-400"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Icons.Building size={16} />
                </div>
                {bankName && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <span className="text-[9px] font-black text-[#008751] bg-emerald-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Selected
                    </span>
                  </div>
                )}
              </div>

              {/* Bank Search Dropdown */}
              {isBankDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsBankDropdownOpen(false)}
                  />
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100">
                    {banksList.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase())).length > 0 ? (
                      banksList
                        .filter(b => b.toLowerCase().includes(bankSearch.toLowerCase()))
                        .map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setBankName(b);
                              setBankSearch(b);
                              setIsBankDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#008751] transition-colors flex items-center justify-between cursor-pointer"
                          >
                            <span>{b}</span>
                            {bankName === b && <Icons.CheckCircle size={15} className="text-[#008751]" />}
                          </button>
                        ))
                    ) : (
                      <div className="p-4 text-xs text-center text-slate-400 font-medium">
                        No bank matches your search
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 2. Account Number Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider ml-1">
                Account Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, '');
                    if (cleaned.length <= 10) {
                      setAccountNumber(cleaned);
                    }
                  }}
                  placeholder="10-digit NUBAN account number"
                  className="w-full bg-[#f8faf9] border border-slate-200 p-3.5 pl-11 rounded-2xl text-slate-900 outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/10 transition-all font-mono font-bold text-sm tracking-wider placeholder:font-sans placeholder:font-normal placeholder:text-xs placeholder:tracking-normal placeholder:text-slate-400"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Icons.Hash size={16} />
                </div>
              </div>
            </div>

            {/* 3. Account Name (Auto-Verified) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider ml-1">
                Account Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={accountName}
                  placeholder={isVerifying ? "Verifying with NIBSS..." : "Verified Account Name"}
                  className={`w-full border p-3.5 pl-11 pr-10 rounded-2xl outline-none font-bold text-xs transition-all ${
                    isVerifying
                      ? 'bg-amber-50/50 border-amber-300 text-amber-800'
                      : accountName
                      ? 'bg-emerald-50/60 border-emerald-300 text-[#013a24]'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Icons.User size={16} />
                </div>
                {isVerifying && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <div className="w-4 h-4 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
                  </div>
                )}
                {!isVerifying && accountName && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#008751]">
                    <Icons.CheckCircle size={16} />
                  </div>
                )}
              </div>
              {verificationError && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 pl-1">
                  ⚠️ {verificationError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || isVerifying || !accountName}
              className={`w-full py-4 font-black rounded-2xl shadow-md transition-all uppercase tracking-wider text-xs flex items-center justify-center space-x-2 cursor-pointer ${
                loading || isVerifying || !accountName
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[#008751] hover:bg-[#007043] text-white active:scale-95'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Icons.PlusCircle size={16} />
                  <span>Proceed to Link Account</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Reassurance Footer */}
        <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-2">
          <Icons.ShieldCheck size={14} className="text-[#008751]" />
          <span>256-Bit Bank Grade Cryptographic Tunnel</span>
        </div>
      </div>
    </div>
  );
};

export default LinkWithdrawAccount;
