import { Chart as ChartJS, registerables } from "chart.js";
import React, { useEffect, useState } from "react";
import { IoIosAt, IoIosLink, IoIosStats, IoLogoGithub, IoMdTrash } from "react-icons/io";
import { RiRoadMapLine } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";

import { getDaysInMonth } from "./utils";

import Loader from "../../components/loader";
import api from "../../services/api";

import ProgressBar from "../../components/ProgressBar";
import SelectMonth from "./../../components/selectMonth";
import { Field as FormField, Formik } from "formik";
import toast from "react-hot-toast";
import validator from "validator";
import LoadingButton from "../../components/loadingButton";
import { formatDate, formatDateDMY, getColorStatus } from "../../utils";

ChartJS.register(...registerables);

export default function ProjectView() {
  const [project, setProject] = useState(null);
  const [copied, setCopied] = React.useState(false);
  const { id } = useParams();
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const { data: u } = await api.get(`/project/${id}`);
      setProject(u);
    })();
  }, []);

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);

  if (!project) return <Loader />;

  return (
    <React.Fragment>
      <div className="pl-20 pt-24 pb-4 w-[98%]">
        <div className="bg-[#FFFFFF] border border-[#E5EAEF] py-3 rounded-[16px]">
          <div className="flex justify-between px-3 pb-2  border-b border-[#E5EAEF]">
            <div className="d-flex justify-center items-center">
              <span className="text-[18px] text-[#212325] font-semibold">Project details</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => history.push(`/project/edit/${project?._id}`)}
                className="border !border-[#0560FD] text-[#0560FD] py-[7px] px-[20px] bg-[#FFFFFF] rounded-[16px]">
                Edit
              </button>
            </div>
          </div>
          <ProjectDetails project={project} />
        </div>
      </div>
    </React.Fragment>
  );
}

const ProjectDetails = ({ project }) => {
  return (
    <div>
      <div className="flex flex-wrap p-3">
        <div className="w-full ">
          <div className="flex gap-3">
            <div className="w-full">
              <div className="flex justify-between gap-2">
                <div className="flex gap-2">
                  <span className="w-fit text-[20px] text-[#0C1024] font-bold">Name of project : </span>
                  <span className="w-fit text-[20px] text-[#0C1024] font-bold">{project.name.toString()}</span>
                </div>
                <div className="flex flex-1 flex-column items-end gap-3">
                  <Links project={project} />
                </div>
              </div>
              <div className="w-full md:w-[50%]">
                <div className="pt-2 ">
                  <span className="text-[16px] text-[#676D7C] font-medium">{project.description ? project.description : ""}</span>
                </div>
                <div className="mt-4 text-[18px] text-[#000000] font-semibold">
                  {`Objective :`} <span className="text-[#676D7C] text-[16px] font-medium">{project.objective ? project.objective : ""}</span>
                </div>
                <div className="mt-2 mr-2">
                  <span className="text-[18px] font-semibold text-[#000000]">Budget consummed {project.paymentCycle === "MONTHLY" && "this month"}:</span>

                  <Budget project={project} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap p-3 gap-4"></div>
      <Activities project={project} />

      {/* TICKET LIST */}
      <TicketList projectId={project._id} />
    </div>
  );
};

const Budget = ({ project }) => {
  const [activities, setActivities] = useState([10, 29, 18, 12]);

  useEffect(() => {
    (async () => {
      let d = new Date();
      let dateQuery = "";
      if (project.paymentCycle === "ONE_TIME") {
        d = new Date(project.created_at);
        dateQuery = "gte:";
      }
      const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
      const { data } = await api.get(`/activity?projectId=${encodeURIComponent(project._id)}&date=${dateQuery}${date.getTime()}`);
      setActivities(data);
    })();
  }, []);

  const total = activities.reduce((acc, cur) => acc + cur.value, 0);
  const budget_max_monthly = project.budget_max_monthly;
  const width = (100 * total) / budget_max_monthly || 0;

  if (!project.budget_max_monthly) return <div className="mt-2 text-[24px] text-[#212325] font-semibold">{total.toFixed(2)}€</div>;
  return <ProgressBar percentage={width} max={budget_max_monthly} value={total} />;
};

const Activities = ({ project }) => {
  const [activities, setActivities] = useState([]);
  const [date, setDate] = useState();
  const [days, setDays] = useState([]);

  useEffect(() => {
    if (!project || !date) return;

    (async () => {
      let from = new Date(date);
      from.setDate(1);
      setDays(getDaysInMonth(from.getMonth(), from.getFullYear()));
      let date_to = new Date(date);
      date_to.setMonth(date_to.getMonth() + 1);
      date_to.setDate(0);
      const { data } = await api.get(`/activity?dateFrom=${from.getTime()}&dateTo=${date_to.getTime()}&projectId=${encodeURIComponent(project._id)}`);
      const users = await api.get(`/user`);

      setActivities(
        data.map((activity) => {
          return { ...activity, user: (activity.userId = users.data.find((user) => user._id === activity.userId)?.name) };
        }),
      );
    })();
  }, [date, project]);

  const getTotal = () => {
    return (activities.reduce((acc, a) => acc + a.total, 0) / 8).toFixed(2);
  };

  return (
    <div>
      <div className="flex flex-wrap p-3 gap-4 text-black	">
        <div className="w-full bg-[#ffffff] border border-[#E5EAEF] rounded-[16px] overflow-hidden">
          <div className="flex gap-5 p-2">
            <SelectMonth start={0} indexDefaultValue={0} value={date} onChange={(e) => setDate(e.target.value)} showArrows />
          </div>
          <div className="mt-2 rounded-[10px] bg-[#fff]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="py-[10px] text-[14px] font-bold text-[#212325] text-left pl-[10px]">Users</th>
                    {days.map((e) => {
                      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                      const _date = new Date(e);
                      const day = _date.getDay();
                      const weekday = days[day];
                      const date = _date.getDate();
                      return (
                        <th
                          className={`w-[20px] border border-[#E5EAEF] text-[12px] font-semibold text-center ${day == 0 || day == 6 ? "bg-[#FFD5F1]" : "bg-[white]"}`}
                          key={e}
                          day={day}>
                          <div>{weekday}</div>
                          <div>{date}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-b border-r border-[#E5EAEF]">
                    <th className="px-2">
                      <div className="flex justify-end w-full text-[12px] font-bold text-[#212325] italic">
                        <div>{`Total ${getTotal()} days`}</div>
                      </div>
                    </th>
                    {days.map((e, i) => {
                      const v = activities.reduce((acc, a) => {
                        if (!a.detail[i]) return acc;
                        return acc + a.detail[i].value;
                      }, 0);
                      return <Field key={i} value={v} disabled />;
                    })}
                  </tr>
                  {activities
                    .sort((a, b) => b.total - a.total)
                    .map((e) => {
                      return (
                        <React.Fragment key={`${e.user}`}>
                          <tr className="border-t border-b border-r border-[#E5EAEF]" key={`1-${e._id}`}>
                            <th className="w-[100px] border-t border-b border-r text-[12px] font-bold text-[#212325] text-left">
                              <div className="flex flex-1 items-center justify-between gap-1 px-2">
                                <div className="flex flex-1 items-center justify-start gap-1">
                                  <img
                                    className="relative z-30 inline object-cover w-[25px] h-[25px] border border-white rounded-full"
                                    src={e?.userAvatar}
                                    alt={`avatar ${e?.user}`}
                                  />
                                  <div>{e.user}</div>
                                </div>
                                <div className="text-md italic font-normal">{(e.total / 8).toFixed(2)} days</div>
                              </div>
                            </th>
                            {e.detail.map((f, j) => {
                              return <Field key={`${e.user} ${j}`} value={f.value || 0} />;
                            })}
                          </tr>
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ value = "-", ...rest }) => {
  let bgColor = "bg-[white]";
  let textColor = "text-[#000]";
  if (value >= 7) {
    bgColor = "bg-[#216E39]";
    textColor = "text-[#fff]";
  } else if (value >= 5) {
    bgColor = "bg-[#30A14E]";
  } else if (value >= 3) {
    bgColor = "bg-[#40C463]";
  } else if (value > 0) {
    bgColor = "bg-[#9BE9A8]";
  } else {
    textColor = "text-[#aaa]";
  }

  return (
    <th className={`border border-[#E5EAEF] py-[6px] ${bgColor} ${textColor}`}>
      <div className={`text-center font-normal `} {...rest}>
        {value}
      </div>
    </th>
  );
};

const Links = ({ project }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {project.website && (
        <div className="group text-sm font-medium	text-gray-700 border-[1px] border-gray-700 rounded-full overflow-hidden">
          <a target="blank" href={project.website} className="break-words cursor-pointer text-gray-700 hover:text-white hover:bg-gray-700 flex hover:no-underline h-full">
            <div className="flex items-center bg-gray-700 py-1 px-2 rounded-r-full ">
              <IoIosAt className="group-hover:scale-110 text-white" />
            </div>
            <div className="flex items-center px-3 py-1">Website</div>
          </a>
        </div>
      )}
      {project.links?.map((link) => (
        <div className="group text-sm font-medium	text-blue-700 border-[1px] border-blue-700 rounded-full overflow-hidden">
          <a target="blank" href={link.url} className="break-words cursor-pointer text-blue-700 hover:text-white hover:bg-blue-700 flex hover:no-underline h-full">
            <div className="flex items-center bg-blue-700 py-1 px-2 rounded-r-full ">
              <IoIosLink className="group-hover:scale-110 text-white" />
            </div>
            <div className="flex items-center px-3 py-1">
              {link?.label?.substring(0, 20)}
              {link?.label?.length > 20 ? "..." : ""}
            </div>
          </a>
        </div>
      ))}
    </div>
  );
};

const TicketList = ({ projectId }) => {
  const [tickets, setTickets] = useState(null);
  const [open, setOpen] = useState(false);

  const getListTicket = async () => {
    const { data: u } = await api.get(`/ticket/list/${projectId}`);
    setTickets(u);
  };

  useEffect(() => {
    getListTicket();
  }, []);

  return (
    <div className=" pt-24 w-[100%]">
      <div className="py-3 rounded-[16px]">
        <div className="flex justify-between px-3 py-2  border-y border-[#E5EAEF]">
          <div className="d-flex justify-center items-center">
            <span className="text-[18px] text-[#212325] font-semibold">Ticket List</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(true)} className="border !border-[#0560FD] text-[#0560FD] py-[7px] px-[20px] bg-[#FFFFFF] rounded-[16px]">
              Add
            </button>
          </div>
        </div>
        {open && (
          <div className=" absolute top-0 bottom-0 left-0 right-0  bg-[#00000066] flex justify-center p-[1rem] z-50 " onClick={() => setOpen(false)}>
            <div
              className="w-full md:w-[60%] h-fit  bg-[white] p-[25px] rounded-md"
              onClick={(e) => {
                e.stopPropagation();
              }}>
              <Formik
                initialValues={{ title: "", deadline: "", description: "" }}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    values.status = "pending";
                    values.projectId = projectId;
                    const res = await api.post("/ticket", values);
                    if (!res.ok) throw res;
                    toast.success("Created!");
                    setOpen(false);
                    getListTicket();
                  } catch (e) {
                    console.log(e);
                    toast.error("Some Error!", e.code);
                  }
                  setSubmitting(false);
                }}>
                {({ values, handleChange, handleSubmit, isSubmitting }) => (
                  <React.Fragment>
                    <div className="d-flex justify-between flex-wrap mb-4">
                      <div className="w-full md:w-[48%] mt-2">
                        <div className="flex flex-col">
                          <div className="text-[14px] text-[#212325] font-medium	">Title</div>
                          <input className="projectsInput text-[14px] font-normal text-[#212325] rounded-[10px]" name="title" value={values.title} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="w-full md:w-[48%] mt-2">
                        <div className="flex flex-col">
                          <div className="text-[14px] text-[#212325] font-medium	">Deadline</div>
                          <input
                            className="projectsInput text-[14px] font-normal text-[#212325] rounded-[10px]"
                            name="deadline"
                            type="date"
                            value={values.deadline}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="w-full md:w-[100%] mt-2">
                        <div className="flex flex-col">
                          <div className="text-[14px] text-[#212325] font-medium">Description</div>
                          <textarea
                            className="w-full border border-[#ced4da] rounded-[10px] text-[14px] font-normal p-2 mt-2  focus:outline-none focus:ring focus:ring-[#80bdff]"
                            type="textarea"
                            rows="5"
                            placeholder="Describe ticket...."
                            name="description"
                            value={values.description}
                            onChange={handleChange}></textarea>
                        </div>
                      </div>
                    </div>
                    <LoadingButton
                      className="mt-[1rem]  bg-[#0560FD] text-[16px] font-medium text-[#FFFFFF] py-[12px] px-[22px] rounded-[10px]"
                      loading={isSubmitting}
                      onClick={handleSubmit}>
                      Save
                    </LoadingButton>
                  </React.Fragment>
                )}
              </Formik>
            </div>
          </div>
        )}
        <div className="p-3">
          {tickets?.length > 0 ? tickets.map((e) => <Ticket key={e._id} ticket={e} getListTicket={getListTicket} />) : <p>There are no tickets for this project yet.</p>}
        </div>
      </div>
    </div>
  );
};

const Ticket = ({ ticket, getListTicket }) => {
  const [status, setStatus] = useState(ticket.status);
  const [currentTicket, setCurrentTicket] = useState(ticket);

  const handleChange = (e) => {
    setStatus(e.target.value);
  };

  const updateStatus = async () => {
    try {
      const values = { ...ticket, status };
      const res = await api.put(`/ticket/${ticket._id}`, values);
      if (!res.ok) throw res;
      setCurrentTicket({ ...ticket, status });
      toast.success("Status updated!");
    } catch (e) {
      console.log(e);
      toast.error("Some Error!", e.code);
    }
  };

  const deleteTicket = async () => {
    console.log("here", ticket._id);
    try {
      const res = await api.remove(`/ticket/${ticket._id}`);
      if (!res.ok) throw res;
      toast.success("Deleted!");
      getListTicket();
    } catch (e) {
      console.log(e);
      toast.error("Some Error!", e.code);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5EAEF] p-3 mt-3 rounded-[16px]">
      <div className="d-flex justify-between">
        <h2 className="w-fit text-[20px] text-[#0C1024] font-bold">
          {currentTicket.title} ({formatDateDMY(currentTicket.deadline)})
        </h2>
        <div className="d-flex justify-center items-center">
          <span className="block h-3 w-3 rounded-full mr-1" style={{ backgroundColor: getColorStatus(currentTicket.status) }}></span>
          <span className="capitalize" style={{ color: getColorStatus(currentTicket.status) }}>
            {currentTicket.status.replaceAll("_", " ")}
          </span>
          <IoMdTrash className="group-hover:scale-110 h-5 w-5 cursor-pointer fill-shade-red ml-4" onClick={deleteTicket} />
        </div>
      </div>
      <p>{currentTicket.description}</p>
      <div className="d-flex items-center justify-center w-[100%] mt-4">
        <select
          className="w-[180px] bg-[#FFFFFF] text-[14px] text-[#212325] font-normal py-[10px] px-[14px] rounded-[10px] border-r-[16px] border-[transparent] cursor-pointer shadow-sm"
          name={name}
          value={status}
          onChange={(e) => handleChange(e)}>
          <option disabled>Update status</option>
          <option key="pending" value="pending">
            Pending
          </option>
          <option key="in_progress" value="in_progress">
            In Progress
          </option>
          <option key="done" value="done">
            Done
          </option>
        </select>
        <button className="bg-[#0560FD] text-[#fff] h-[100%] ml-3 py-[8px] px-[20px] rounded-[10px] text-[16px] font-medium" onClick={() => updateStatus()}>
          Confirm
        </button>
      </div>
    </div>
  );
};
