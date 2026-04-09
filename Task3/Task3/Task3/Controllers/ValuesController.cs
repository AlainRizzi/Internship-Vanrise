using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Task3.Models;
using System.Configuration;
using System.Data.SqlClient;

namespace Task3.Controllers
{
    public class ValuesController : ApiController
    {
            //[HttpGet]
            //[Route("api/devices/testconnection")]
            //public IHttpActionResult TestConnection()
            //{
            //    // Get the connection string from Web.config
            //    string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

            //    try
            //    {
            //        using (SqlConnection connection = new SqlConnection(connectionString))
            //        {
            //            connection.Open();  // Try to open the connection
            //            return Ok("✅ Connected to database successfully!");
            //        }
            //    }
            //    catch (Exception ex)
            //    {
            //        return InternalServerError(ex);  // Show error if failed
            //    }
            //}

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

        [HttpGet()]
        [Route("api/devices")]
        public IEnumerable<Device> GetAllDevices()
        {
            return devices;
        }

        [HttpGet()]
        [Route("api/devices/filter")]
        public IEnumerable<Device> GetFilteredDevices(string Name)
        {
            if (string.IsNullOrWhiteSpace(Name))
                return devices;
            List<Device> filteredDevices = new List<Device>();
            foreach (var device in devices) 
            {
                if (device.name!=null && device.name.Trim().ToLower().Contains(Name.ToLower()))
                    filteredDevices.Add(device);
            }
            return filteredDevices;
        }

        [HttpPost()]
        [Route("api/devices")]
        public IHttpActionResult AddDevice(Device newDevice)
        {
            if (newDevice==null||string.IsNullOrWhiteSpace(newDevice.name))
                    return BadRequest("Invalid device");
            foreach (var device in devices)
            {
                if (device.id == newDevice.id || device.name != null && device.name.ToLower().Trim() == newDevice.name.ToLower().Trim())
                    return Conflict();
            }

            int nextId = devices.Any() ? devices.Max(d => d.id) + 1 : 1;
            newDevice.id = nextId;
            devices.Add(newDevice);
            return Ok(newDevice);
        }

        [HttpPut()]
        [Route("api/devices/{id}")]
        public IHttpActionResult UpdateDevice(int id, Device updatedDevice)
        {
            if (updatedDevice == null || string.IsNullOrWhiteSpace(updatedDevice.name))
                return BadRequest("Invalid data");

            Device foundDevice = null;

            foreach (var d in devices)
            {
                if (d.name.Trim().ToLower() == updatedDevice.name.Trim().ToLower())
                {
                    return Conflict();
                }
            }

            foreach (var d in devices)
            {
                if (d.id == id)
                {
                    foundDevice = d;
                    break;
                }
            }

            if (foundDevice == null)
                return NotFound();

            foundDevice.name = updatedDevice.name.Trim();
            return Ok(foundDevice);
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
