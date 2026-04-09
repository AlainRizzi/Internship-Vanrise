using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Task4.Models;

namespace Task4.Controllers
{
    public class ValuesController : ApiController
    {
        [HttpGet]
        [Route("api/devices/testconnection")]
        public IHttpActionResult TestConnection()
        {
            // Get the connection string from Web.config
            string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();  // Try to open the connection
                    return Ok("✅ Connected to database successfully!");
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);  // Show error if failed
            }
        }

        // GET api/values
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/values
        public void Post([FromBody] string value)
        {
        }

        // PUT api/values/5
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
        }

        //[HttpGet]
        //[Route("api/devices/getall")]
        //public IHttpActionResult GetAllDevices()
        //{
        //    List<Device> devices = new List<Device>();
        //    string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

        //    using (SqlConnection conn = new SqlConnection(connectionString))
        //    {
        //        string query = "SELECT id, name FROM Device";
        //        SqlCommand cmd = new SqlCommand(query, conn);
        //        conn.Open();

        //        SqlDataReader reader = cmd.ExecuteReader();
        //        while (reader.Read())
        //        {
        //            devices.Add(new Device
        //            {
        //                id = (int)reader["id"],
        //                name = reader["name"].ToString()
        //            });
        //        }
        //    }

        //    return Ok(devices);
        //}


        //[HttpGet]
        //[Route("api/devices/filter")]
        //public IHttpActionResult GetFilteredDevices(string name)
        //{
        //    List<Device> devices = new List<Device>();
        //    string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

        //    using (SqlConnection conn = new SqlConnection(connectionString))
        //    {
        //        // Use LIKE for partial match, and ISNULL to handle empty filter
        //        string query = "SELECT id, name FROM Device WHERE @name IS NULL OR name LIKE '%' + @name + '%'";
        //        SqlCommand cmd = new SqlCommand(query, conn);
        //        cmd.Parameters.AddWithValue("@name", (object)name ?? DBNull.Value);

        //        conn.Open();
        //        SqlDataReader reader = cmd.ExecuteReader();
        //        while (reader.Read())
        //        {
        //            devices.Add(new Device
        //            {
        //                id = (int)reader["id"],
        //                name = reader["name"].ToString()
        //            });
        //        }
        //    }

        //    return Ok(devices);
        //}


        //[HttpPost]
        //[Route("api/devices/add")]
        //public IHttpActionResult AddDevice(Device device)
        //{
        //    if (device == null || string.IsNullOrWhiteSpace(device.name))
        //        return BadRequest("Invalid device");

        //    string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

        //    using (SqlConnection conn = new SqlConnection(connectionString))
        //    {
        //        string query = "INSERT INTO Device (name) VALUES (@name)";
        //        SqlCommand cmd = new SqlCommand(query, conn);
        //        cmd.Parameters.AddWithValue("@name", device.name);

        //        conn.Open();
        //        int rowsAffected = cmd.ExecuteNonQuery();
        //        if (rowsAffected > 0)
        //            return Ok("Device added");
        //        else
        //            return InternalServerError();
        //    }
        //}


        //[HttpPut]
        //[Route("api/devices/update")]
        //public IHttpActionResult UpdateDevice(Device device)
        //{
        //    if (device == null || device.id <= 0 || string.IsNullOrWhiteSpace(device.name))
        //        return BadRequest("Invalid device");

        //    string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

        //    using (SqlConnection conn = new SqlConnection(connectionString))
        //    {
        //        string query = "UPDATE Device SET name = @name WHERE id = @id";
        //        SqlCommand cmd = new SqlCommand(query, conn);
        //        cmd.Parameters.AddWithValue("@name", device.name);
        //        cmd.Parameters.AddWithValue("@id", device.id);

        //        conn.Open();
        //        int rowsAffected = cmd.ExecuteNonQuery();
        //        if (rowsAffected > 0)
        //            return Ok("Device updated");
        //        else
        //            return NotFound();
        //    }
        //}

        [HttpGet]
        [Route("api/devices/getall")]
        public IHttpActionResult GetAllDevices()
        {
            List<Device> devices = new List<Device>();
            string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("sp_GetAllDevices", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    devices.Add(new Device
                    {
                        id = (int)reader["id"],
                        name = reader["name"].ToString()
                    });
                }
            }

            return Ok(devices);
        }

        [HttpGet]
        [Route("api/devices/filter")]
        public IHttpActionResult GetFilteredDevices(string name)
        {
            List<Device> devices = new List<Device>();
            string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("sp_GetFilteredDevices", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@name", (object)name ?? DBNull.Value);

                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    devices.Add(new Device
                    {
                        id = (int)reader["id"],
                        name = reader["name"].ToString()
                    });
                }
            }

            return Ok(devices);
        }

        [HttpPost]
        [Route("api/devices/add")]
        public IHttpActionResult AddDevice(Device device)
        {
            if (device == null || string.IsNullOrWhiteSpace(device.name))
                return BadRequest("Invalid device");

            string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("sp_AddDevice", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@name", device.name);

                conn.Open();
                int rows = cmd.ExecuteNonQuery();

                if (rows > 0)
                    return Ok("Device added");
                else
                    return InternalServerError();
            }
        }

        [HttpPut]
        [Route("api/devices/update")]
        public IHttpActionResult UpdateDevice(Device device)
        {
            if (device == null || device.id <= 0 || string.IsNullOrWhiteSpace(device.name))
                return BadRequest("Invalid device");

            string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("sp_UpdateDevice", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@id", device.id);
                cmd.Parameters.AddWithValue("@name", device.name);

                conn.Open();
                int rows = cmd.ExecuteNonQuery();

                if (rows > 0)
                    return Ok("Device updated");
                else
                    return NotFound();
            }
        }



        private static readonly List<Device> devices = new List<Device>
        {
            new Device {id=1, name="Samsung A50"},
            new Device {id=2, name="iPhone 13"},
            new Device {id=3, name="iPhone 14 Pro"},
            new Device {id=4, name="Huawei P30"},
            new Device {id=5, name="LG G8 ThinQ"}
        };
    }
}
