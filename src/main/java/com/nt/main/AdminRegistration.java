package com.nt.main;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/registration")
public class AdminRegistration  extends HttpServlet {
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		PrintWriter pw=res.getWriter();
		res.setContentType("text/html");
		try {
			Class.forName("oracle.jdbc.driver.OracleDriver");
			Connection con=DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:orcl","proj","hk");
			PreparedStatement GA=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHGA%'");
			PreparedStatement GB=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHGB%'");
			PreparedStatement GC=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHGC%'");
			PreparedStatement GD=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHGD%'");
			
			PreparedStatement FA=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHFA%'");
			PreparedStatement FB=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHFB%'");
			PreparedStatement FC=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHFC%'");
			PreparedStatement FD=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHFD%'");
			
			PreparedStatement SA=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHSA%'");
			PreparedStatement SB=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHSB%'");
			PreparedStatement SC=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHSC%'");
			PreparedStatement SD=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHSD%'");
			
			PreparedStatement TA=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHTA%'");
			PreparedStatement TB=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHTB%'");
			PreparedStatement TC=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHTC%'");
			PreparedStatement TD=con.prepareStatement("SELECT COUNT(*) FROM STUDENTS WHERE ROOM_NO LIKE 'SHTD%'");
			
			ResultSet rga=GA.executeQuery();
			rga.next();
			int iga=rga.getInt(1);
			ResultSet rgb=GB.executeQuery();
			rgb.next();
			int igb=rgb.getInt(1);
			ResultSet rgc=GC.executeQuery();
			rgc.next();
			int igc=rgc.getInt(1);
			ResultSet rgd=GD.executeQuery();
			rgd.next();
			int igd=rgd.getInt(1);
			
			ResultSet rfa=FA.executeQuery();
			rfa.next();
			int ifa=rfa.getInt(1);
			ResultSet rfb=FB.executeQuery();
			rfb.next();
			int ifb=rfb.getInt(1);
			ResultSet rfc=FC.executeQuery();
			rfc.next();
			int ifc=rfc.getInt(1);
			ResultSet rfd=FD.executeQuery();
			rfd.next();
			int ifd=rfd.getInt(1);
			
			ResultSet rsa=SA.executeQuery();
			rsa.next();
			int isa=rsa.getInt(1);
			ResultSet rsb=SB.executeQuery();
			rsb.next();
			int isb=rsb.getInt(1);
			ResultSet rsc=SC.executeQuery();
			rsc.next();
			int isc=rsc.getInt(1);
			ResultSet rsd=SD.executeQuery();
			rsd.next();
			int isd=rsd.getInt(1);
	
			ResultSet rta=TA.executeQuery();
			rta.next();
			int ita=rta.getInt(1);
			ResultSet rtb=TB.executeQuery();
			rtb.next();
			int itb=rtb.getInt(1);
			ResultSet rtc=TC.executeQuery();
			rtc.next();
			int itc=rtc.getInt(1);
			ResultSet rtd=TD.executeQuery();
			rtd.next();
			int itd=rtd.getInt(1);
			
			int a_add=iga+ifa+isa+ita;
			int b_add=igb+ifb+isb+itb;
			int c_add=igc+ifc+isc+itc;
			int d_add=igd+ifd+isd+itd;
			
			int g_add=iga+igb+igc+igd;
			int f_add=ifa+ifb+ifc+ifd;
			int s_add=isa+isb+isc+isd;
			int t_add=ita+itb+itc+itd;
			
		    
			int count=a_add+b_add+c_add+d_add;
			

			pw.println("<!DOCTYPE html>\r\n"
					+ "<html lang=\"en\" >\r\n"
					+ "<head>\r\n"
					+ "  <meta charset=\"UTF-8\">\r\n"
					+ "  <link rel=\"icon\" href=\"hostel.jpeg\" style=\"background-color: white;\">\r\n"
					+ "  <title>SGGS Hostel Portal</title>\r\n"
					+ "  <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css\">\r\n"
					+ "  <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css\" >\r\n"
					+ "  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\r\n"
					+ "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\r\n"
					+ "<link href=\"https://fonts.googleapis.com/css2?family=Lobster&family=Roboto+Slab:wght@400;500&display=swap\" rel=\"stylesheet\">\r\n"
					+ "  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\r\n"
					+ "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\r\n"
					+ "<link href=\"https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;500&display=swap\" rel=\"stylesheet\">\r\n"
					+ "  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\r\n"
					+ "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\r\n"
					+ "<link href=\"https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@500&display=swap\" rel=\"stylesheet\"\r\n"
					+ "integrity=\"sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\" />\r\n"
					+ "<link rel=\"stylesheet\" href=\"registration.css\">\r\n"
					+ "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js\"></script>\r\n"
					+ "\r\n"
					+ "\r\n"
					+ "\r\n"
					+ "</head>\r\n"
					+ "<body>\r\n"
					+ "<!-- partial:index.partial.html -->\r\n"
					+ "<div class=\"top\">\r\n"
					+ "\r\n"
					+ "  <div class=\"header\">\r\n"
					+ "    <img src=\"collage_logo.png\" alt=\"logo\" />\r\n"
					+ "    <h1>SHRI GURU GOBIND SINGHJI <br> INSTITUTE OF ENGINEERING AND TECHNOLOGY, <br> VISHNUPURI, NANDED : 431606  <br><span class=\"font_header\">(An Autonomous Institute Owned by Government of Maharashtra)</span>\r\n"
					+ "     <br>\r\n"
					+ "    <br ></h1>\r\n"
					+ "  </div>\r\n"
					+ "</div>\r\n"
					+ "<div class=\"mains\">\r\n"
					+ "  \r\n"
					+ "    <div class=\"left\">\r\n"
					+ "        <h3>Admin Pannel</h3>\r\n"
					+ "       \r\n"
					+ "          <div class=\"line\">\r\n"
					+ "            <i class=\"fa-solid fa-code-pull-request\"></i>\r\n"
					+ "            <a class=\"side_h\" style=\"display: inline; \" href=\"/HostelManagementSystem/request\">Request </a>\r\n"
					+ "          </div>\r\n"
					+ "          \r\n"
					+ "          <div class=\"line\">\r\n"
					+ "            <i class=\"fa-solid fa-address-card\"></i>\r\n"
					+ "            <a class=\"side_h\" style=\"display: inline;\" href=\"/HostelManagementSystem/registration\">Registration</a>\r\n"
					+ "          </div>\r\n"
					+ "          <div class=\"line\">\r\n"
					+ "            <i class=\"fa-solid fa-person\"></i>\r\n"
					+ "            <a class=\"side_h\" style=\"display: inline;\" href=\"/HostelManagementSystem/students\">&nbsp;Students</a>\r\n"
					+ "          </div>\r\n"
					+ "          <div class=\"line\">\r\n"
					+ "            <i class=\"fa-solid fa-gear\"></i>\r\n"
					+ "            <a class=\"side_h\" style=\"display: inline;\" href=\"setting.html\">Settings</a>\r\n"
					+ "          </div>\r\n"
					+"       <div class=\"line\">\r\n"
							+ "            <i class=\"fa-solid fa-address-card\"></i>\r\n"
							+ "            <a class=\"side_h\" style=\"display: inline;\" href=\"allot.html\">Allot Room</a>\r\n"
							+ "          </div>\r\n"
					+ "          <div class=\"line\">\r\n"
					+ "            <i class=\"fa-solid fa-right-from-bracket\"></i>\r\n"
					+ "            <a class=\"side_h\" style=\"display: inline;\" href=\"/HostelManagementSystem/index.html\">Log Out</a>\r\n"
					+ "          </div>\r\n"
					+ "        <hr>\r\n"
					+ "        <a class=\"side_a\" href=\"#\"><br>Rules and regulations</a>\r\n"
					+ "        <br>\r\n"
					+ "        \r\n"
				
					+ "    </div>\r\n"
					+ "    <div class=\"other\">\r\n"
					+ "        <div class=\"top_s\">\r\n"
					+ "            <div class=\"left_s\">\r\n"
					+ "                <h2 style=\"margin-top: 0;\">Room Table</h2>\r\n"
					+ "                <table class=\"floor-table\">\r\n"
					+ "                    \r\n");
			       pw.println("    <tr>\r\n"
			       		+ "                        <th>Block</th>\r\n"
			       		+ "                        <th>Ground Floor</th>\r\n"
			       		+ "                        <th>1st Floor</th>\r\n"
			       		+ "                        <th>2nd Floor</th>\r\n"
			       		+ "                        <th>3rd Floor</th>\r\n"
			       		+ "                        <th class=\"total-column\">Total</th>\r\n"
			       		+ "                    </tr>\r\n"
			       		+ "                    <tr>\r\n"
			       		+ "                        <td>A</td>\r\n"
			       		+ "                        <td>"+iga+"</td>\r\n"
			       		+ "                        <td>"+ifa+"</td>\r\n"
			       		+ "                        <td>"+isa+"</td>\r\n"
			       		+ "                        <td>"+ita+"</td>\r\n"
			       		+ "                        <td class=\"total-column\">"+a_add+"</td>\r\n"
			       		+ "                    </tr>\r\n"
			       		+ "                    <tr>\r\n"
			       		+ "                        <td>B</td>\r\n"
			       		+ "                        <td>"+igb+"</td>\r\n"
			       		+ "                        <td>"+ifb+"</td>\r\n"
			       		+ "                        <td>"+isb+"</td>\r\n"
			       		+ "                        <td>"+itb+"</td>\r\n"
			       		+ "                        <td class=\"total-column\">"+b_add+"</td>\r\n"
			       		+ "                    </tr>\r\n"
			       		+ "                    <tr>\r\n"
			       		+ "                        <td>C</td>\r\n"
			       		+ "                        <td>"+igc+"</td>\r\n"
			       		+ "                        <td>"+ifc+"</td>\r\n"
			       		+ "                        <td>"+isc+"</td>\r\n"
			       		+ "                        <td>"+itc+"</td>\r\n"
			       		+ "                        <td class=\"total-column\">"+c_add+"</td>\r\n"
			       		+ "                    </tr>\r\n"
			       		+ "                    <tr>\r\n"
			       		+ "                        <td>D</td>\r\n"
			       		+ "                        <td>"+igd+"</td>\r\n"
			       		+ "                        <td>"+ifd+"</td>\r\n"
			       		+ "                        <td>"+isd+"</td>\r\n"
			       		+ "                        <td>"+itd+"</td>\r\n"
			       		+ "                        <td class=\"total-column\">"+d_add+"</td>\r\n"
			       		+ "                    </tr>\r\n"
			       		+ "                    <tr class=\"total-row\">\r\n"
			       		+ "                        <th>Total</th>\r\n"
			       		+ "                        <td>"+g_add+"</td>\r\n"
			       		+ "                        <td>"+f_add+"</td>\r\n"
			       		+ "                        <td>"+s_add+"</td>\r\n"
			       		+ "                        <td>"+t_add+"</td>\r\n"
			       		+ "                        <td class=\"total-column\">"+count+"</td>\r\n"
			       		+ "                    </tr>\r\n"
			       		+ "                </table>"
			       		+"</div>");
			       pw.println("<div class=\"right_s1\">\r\n"
			       		+ "                <div class=\"form-container\">\r\n"
			       		+ "                <h2 class=\"form-heading\" style=\"margin-top: 0;\">Student Vacancy Form</h2>\r\n"
			       		+ "                <form action='/HostelManagementSystem/registrationsort' method='post'>\r\n"
			       		+ "                    <div class=\"row1\">\r\n"
			       		+ "                    <div class=\"form-row\">\r\n"
			       		+ "                        <label for=\"year\" class=\"form-label\">Select Year:</label>\r\n"
			       		+ "                        <select id=\"year\" name=\"year\" class=\"form-select\">\r\n"
			       		+ "                            <option value=\"FY\">FY</option>\r\n"
			       		+ "                            <option value=\"SY\">SY</option>\r\n"
			       		+ "                            <option value=\"TY\">TY</option>\r\n"
			       		+ "                            <option value=\"BTech\">BTech</option>\r\n"
			       		+ "                        </select>\r\n"
			       		+ "                    </div>\r\n"
			       		+ "        \r\n"
			      
			       		+ "                </div>\r\n"
			       		+ "                  \r\n"
			       		+ "                    <div class=\"zero\">\r\n"
			       		+ "                    <div class=\"one\">\r\n"
			       		+ "                    <label for=\"cse\" class=\"form-label\">CSE:</label>\r\n"
			       		+ "                    <input type=\"number\" id=\"cse\" name=\"cse\" class=\"form-input\" min=\"0\">\r\n"
			       		+ "        \r\n"
			       		+ "                    <label for=\"it\" class=\"form-label\">IT:</label>\r\n"
			       		+ "                    <input type=\"number\" id=\"it\" name=\"it\" class=\"form-input\" min=\"0\">\r\n"
			       		+ "        \r\n"
			       		+ "                    <label for=\"extc\" class=\"form-label\">EXTC:</label>\r\n"
			       		+ "                    <input type=\"number\" id=\"extc\" name=\"extc\" class=\"form-input\" min=\"0\">\r\n"
			       		+ "                        \r\n"
			       		+ "                </div>\r\n"
			       		+ "                <div class=\"two\">\r\n"
			       		+ "                    <label for=\"instru\" class=\"form-label\">Instru:</label>\r\n"
			       		+ "                    <input type=\"number\" id=\"instru\" name=\"instru\" class=\"form-input\" min=\"0\">\r\n"
			       		+ "               \r\n"
			       		+ "                    <label for=\"prod\" class=\"form-label\">Prod:</label>\r\n"
			       		+ "                    <input type=\"number\" id=\"prod\" name=\"prod\" class=\"form-input\" min=\"0\">\r\n"
			       		+ "                \r\n"
			       		+ "                \r\n"
			       		+ "                    <label for=\"chem\" class =\"form-label\">Chem:</label>\r\n"
			       		+ "                    <input type=\"number\" id=\"chem\" name=\"chem\" class=\"form-input\" min=\"0\">\r\n"
			       		+ "\r\n"
			       		+ "                </div>\r\n"
			       		+ "                <div class=\"three\">\r\n"
			       		+ "                    <label for=\"civil\" class=\"form-label\">Civil:</label>\r\n"
			       		+ "                    <input type=\"number\" id=\"civil\" name=\"civil\" class=\"form-input\" min=\"0\">\r\n"
			       		+ "               \r\n"
			       		+ "                    <label for=\"textile\" class=\"form-label\">Text:</label>\r\n"
			       		+ "                    <input type=\"number\" id=\"textile\" name=\"text\" class=\"form-input\" min=\"0\">\r\n"
			       		+ "        \r\n"
			       		+ "                    <label for=\"mech\" class=\"form-label\">Mech:</label>\r\n"
			       		+ "                    <input type=\"number\" id=\"mech\" name=\"mech\" class=\"form-input\" min=\"0\">\r\n"
			       		+ "                </div>\r\n"
			       		+ "                <div class=\"four\">\r\n"
			       		+ "                    <label for=\"elec\" class=\"form-label\">Elec:</label>\r\n"
			       		+ "                    <input type=\"number\" id=\"elec\" name=\"elec\" class=\"form-input\" min=\"0\">\r\n"
			       		+ "                    <input style=\"margin-top: 43px;left: 20px; position: relative; width: auto;\" type=\"submit\" value=\"Submit\" class=\"form-submit\">\r\n"
			       		+ "                </div>\r\n"
			       		+ "            </div>\r\n"
			       		+ "        \r\n"
			       		+ "                    \r\n"
			       		+ "                </form>\r\n"
			       		+ "        \r\n"
			       		+ "            </div>");
					pw.println(		
                     "                \r\n"
					+ "           \r\n"
					+ "                  \r\n"
					+ "            \r\n"
					+ "        </div>\r\n"
					+ "        <div class=\"right_s2\">\r\n"
					+ "         \r\n"
					+ "           \r\n"
					+ "        </div>\r\n"
					+ "        </div>\r\n"
					+ "        \r\n"
					+ "        <div class=\"bottom_s\">\r\n"
					+ "          \r\n"
					+ "          <table class=\"leave-app-table\">\r\n"
					+ "            <thead>\r\n"
					+ "                <tr>\r\n"
					+ "                    <th>Sr No</th>\r\n"
					+ "                    <th>Reg No</th>\r\n"
					+ "                    <th>Name</th>\r\n"
					+ "                    <th>Year</th>\r\n"
					+ "                    <th>Branch</th>\r\n"
					+ "                    <th>Purpose</th>\r\n"
					+ "                    <th>Phone</th>\r\n"
					+ "                    <th>Eamil</th>\r\n"
					+ "                    <th>CGPA</th>\r\n"
					+ "                    <th ><div class=\"download\">\r\n"
				
					+ "                      \r\n"
					+ "                  </div></th>\r\n"
					+ "                </tr>\r\n"
					+ "            </thead>\r\n"
					+ "            <tbody>");
			PreparedStatement ps=con.prepareStatement("SELECT ROWNUM, REGISTRATION.REG_NO, USER_STUDENTS.F_NAME, USER_STUDENTS.L_NAME, REGISTRATION.YEAR, USER_STUDENTS.BRANCH, REGISTRATION.PURPOSE, USER_STUDENTS.PHONE, USER_STUDENTS.EMAIL, MARKS.CGPA FROM REGISTRATION INNER JOIN USER_STUDENTS ON REGISTRATION.REG_NO=USER_STUDENTS.REG_NO INNER JOIN MARKS ON MARKS.REG_NO=REGISTRATION.REG_NO");
			ResultSet rs=ps.executeQuery();
			while(rs.next()){
				String rowno=rs.getString(1);
				String regno=rs.getString(2).toUpperCase();
				String fname=rs.getString(3);
				String lname=rs.getString(4);
				String year=rs.getString(5);
				String name=fname+ " " +lname;
				String branch=rs.getString(6);
				String purpose=rs.getString(7);
				String phone=rs.getString(8);
				String email=rs.getString(9);
				String address=rs.getString(10);
				pw.println(
						"                <tr>\r\n"
								+ "                    <td>"+rowno+"</td>\r\n"
								+ "                    <td>"+regno+"</td>\r\n"
								+ "                    <td>"+name+"</td>\r\n"
								+ "                    <td>"+year+"</td>\r\n"
								+ "                    <td>"+branch+"</td>\r\n"
								+ "                    <td>"+purpose+"</td>\r\n"
								+ "                    <td>"+phone+"</td>\r\n"
								+ "                    <td>"+email+"</td>\r\n"
								+ "                    <td>"+address+"</td>\r\n"    
								+ "                    <td class=\"leave-app-actions\">\r\n");
								
				                 pw.println(
								"                        \r\n"
								+ "                    </td>\r\n"
								+ "                </tr>\r\n");
			}
				pw.println(
						"                \r\n"
								+ "               \r\n"
								+ "                \r\n"
								+ "            </tbody>\r\n"
								+ "        </table>\r\n"
								+ "        \r\n"
								+ "        \r\n"
								+ "        </div>\r\n"
								+ "    </div>\r\n"
								+ "     \r\n"
								+ "     \r\n"
								+ "\r\n"
								+ "\r\n"
								+ "  </div>\r\n"
								+ "</div>  \r\n"
								+ "</body>\r\n"
								+ "</html>");
			


		}catch(Exception e) {
			e.printStackTrace();
		}

	}
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
      doGet(req,res);
	}

}
