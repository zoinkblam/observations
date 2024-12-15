import cdsapi
from pathlib import Path
import os
from datetime import datetime

current_second = datetime.now().second
current_minute = datetime.now().minute
current_hour = datetime.now().hour

current_day = datetime.now().day
current_month = datetime.now().month
current_year = datetime.now().year

c = cdsapi.Client()

years = ['2023', '2024']
for year in years:
    params = ['2m_temperature', 'total_precipitation', '10m_u_component_of_wind', '10m_v_component_of_wind']
    for param in params:
        filenameOption1 = 'centralMaineHistoricalHourlyData' + year + '_' + param + '.grib'
        filenameOption2 = 'centralMaineTempData' + year + '_' + param + '.grib'
        if not os.path.exists(filenameOption1) and not os.path.exists(filenameOption2):
            c.retrieve(
                'reanalysis-era5-land',
                {
                    'variable': param,
                    'year': year,
                    'month': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11' '12'],
                    'day': [
                        '01', '02', '03',
                        '04', '05', '06',
                        '07', '08', '09',
                        '10', '11', '12',
                        '13', '14', '15',
                        '16', '17', '18',
                        '19', '20', '21',
                        '22', '23', '24',
                        '25', '26', '27',
                        '28', '29', '30',
                        '31',
                    ],
                    'time': [
                        '00:00', '01:00', '02:00',
                        '03:00', '04:00', '05:00',
                        '06:00', '07:00', '08:00',
                        '09:00', '10:00', '11:00',
                        '12:00', '13:00', '14:00',
                        '15:00', '16:00', '17:00',
                        '18:00', '19:00', '20:00',
                        '21:00', '22:00', '23:00',
                    ],
                    'format': 'grib',
                    "download_format": "unarchived"
                },
                'centralMaineHistoricalHourlyData' + year + '_' + param + '.grib')
            
# dataset = "reanalysis-era5-single-levels"
# request = {
#     "product_type": ["reanalysis"],
#     "variable": [
#         "10m_u_component_of_wind",
#         "10m_v_component_of_wind",
#         "2m_temperature",
#         "total_precipitation",
#         "instantaneous_10m_wind_gust"
#     ],
#     "data_format": "grib",
#     "download_format": "unarchived"
# }

# client = cdsapi.Client()
# client.retrieve(dataset, request).download()