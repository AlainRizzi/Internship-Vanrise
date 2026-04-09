using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Task7.Models;

namespace Task7.Controllers
{
    public class PhoneNumbersReportController : ApiController
    {

        private readonly string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

        [HttpGet]
        [Route("api/reports/phone-number-reservations")]
        public IHttpActionResult GetPhoneReservationReport(int? deviceId = null, int? status = null)
        {
            var result = new List<PhoneReservationReport>();
            using (var conn = new SqlConnection(connectionString))
            using (var cmd = new SqlCommand("GetPhoneNumberReservationReport", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@DeviceID", (object)deviceId ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Status", (object)status ?? DBNull.Value);
                conn.Open();
                var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    result.Add(new PhoneReservationReport
                    {
                        Device = reader["DeviceName"].ToString(),
                        Status = reader["PhoneNumberStatus"].ToString(),
                        Count = (int)reader["CountOfPhoneNumbers"]
                    });
                }
            }
            return Ok(result);
        }
    }
}
