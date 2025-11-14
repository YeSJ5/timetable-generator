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

@WebServlet("/registrationsort")
public class AdminRegistrationSort extends HttpServlet {
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		PrintWriter pw=res.getWriter();
		res.setContentType("text/html");
	
		int count=0;
		String year=req.getParameter("year");
		String yr="1";
	   if(year.equals("FY")) {
			yr="1";
		}else if(year.equals("SY")) {
			yr="2";
		}else if(year.equals("TY")) {
			yr="3";
		}else if(year.equals("BTech")) {yr="4";}
	   
		String cse=req.getParameter("cse");
		if(cse.equals(null)) cse="0";
		String civil=req.getParameter("civil");
		if(civil.equals(null)) civil="0";
		String extc=req.getParameter("extc");
		if(extc.equals(null)) extc="0";
		String it=req.getParameter("it");
		if(it.equals(null)) it="0";
		String mech=req.getParameter("mech");
		if(mech.equals(null)) mech="0";
		String text=req.getParameter("text");
		if(text.equals(null)) text="0";
		String chem=req.getParameter("chem");
		if(chem.equals(null)) chem="0";
		String elec=req.getParameter("elec");
		if(elec.equals(null)) elec="0";
		String instru=req.getParameter("instru");
		if(instru.equals(null)) instru="0";
		String prod=req.getParameter("prod");
		if(prod.equals(null)) prod="0";
		System.out.println(year);
		System.out.println(civil);
		
	
		pw.println("year::"+year);
		pw.println("civil::"+civil);
		pw.println("chem::"+chem);
		pw.println("cse::"+cse);
		pw.println("elec::"+elec);
		pw.println("extx::"+extc);
		pw.println("instru::"+instru);
		pw.println("it::"+it);
		pw.println("mech::"+mech);
		pw.println("prod::"+prod);
		pw.println("text::"+text);
		
		pw.println("<br>");
		try {
			System.out.println("come to this page");
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
			
		    
			int counts=a_add+b_add+c_add+d_add;
			

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
			       		+ "                        <td class=\"total-column\">"+counts+"</td>\r\n"
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
					
				    try {
					PreparedStatement ps1=con.prepareStatement("SELECT * FROM ( SELECT REGISTRATION.REG_NO, USER_STUDENTS.F_NAME, USER_STUDENTS.L_NAME, REGISTRATION.YEAR, USER_STUDENTS.BRANCH, REGISTRATION.PURPOSE, USER_STUDENTS.PHONE, USER_STUDENTS.EMAIL, MARKS.CGPA FROM REGISTRATION INNER JOIN USER_STUDENTS ON REGISTRATION.REG_NO = USER_STUDENTS.REG_NO  INNER JOIN MARKS ON REGISTRATION.REG_NO = MARKS.REG_NO WHERE REGISTRATION.YEAR = '"+yr+"' AND USER_STUDENTS.BRANCH = 'CIVIL' ORDER BY MARKS.CGPA DESC ) WHERE ROWNUM <= "+civil+"");
					//ps1.setString(1, "CIVIL");
				   //ps1.setString(2,yr );
				   //ps1.setString(3,civil);
					ResultSet rs1=ps1.executeQuery();
					while(rs1.next()) {
						count++;
						System.out.println("while loop");
						String regno=rs1.getString(1);
						String fname=rs1.getString(2);
						String lname=rs1.getString(3);
						String name=fname+lname;
						String years=rs1.getString(4);
						String branch=rs1.getString(5);
						String purpose=rs1.getString(6);
						String phone=rs1.getString(7);
						String email=rs1.getString(8);
						String cgpa=rs1.getString(9);
						
						pw.println(
								"                <tr>\r\n"
										+ "                    <td>"+count+"</td>\r\n"
										+ "                    <td>"+regno+"</td>\r\n"
										+ "                    <td>"+name+"</td>\r\n"
										+ "                    <td>"+years+"</td>\r\n"
										+ "                    <td>"+branch+"</td>\r\n"
										+ "                    <td>"+purpose+"</td>\r\n"
										+ "                    <td>"+phone+"</td>\r\n"
										+ "                    <td>"+email+"</td>\r\n"
										+ "                    <td>"+cgpa+"</td>\r\n"    
										+ "                    <td class=\"leave-app-actions\">\r\n");
										
						                 pw.println(
										"                        \r\n"
										+ "                    </td>\r\n"
										+ "                </tr>\r\n");
					}
				    }catch(Exception e ) {e.printStackTrace();}
					//=================================================================================
				    try {
					PreparedStatement ps2=con.prepareStatement("SELECT * FROM ( SELECT REGISTRATION.REG_NO, USER_STUDENTS.F_NAME, USER_STUDENTS.L_NAME, REGISTRATION.YEAR, USER_STUDENTS.BRANCH, REGISTRATION.PURPOSE, USER_STUDENTS.PHONE, USER_STUDENTS.EMAIL, MARKS.CGPA FROM REGISTRATION INNER JOIN USER_STUDENTS ON REGISTRATION.REG_NO = USER_STUDENTS.REG_NO  INNER JOIN MARKS ON REGISTRATION.REG_NO = MARKS.REG_NO WHERE REGISTRATION.YEAR = '"+yr+"' AND USER_STUDENTS.BRANCH = 'CHEM' ORDER BY MARKS.CGPA DESC ) WHERE ROWNUM <= "+chem+"");
					   
//					ps2.setString(1, "CHEM");
//					ps2.setString(2,yr );
//					ps2.setString(3,chem);
					ResultSet rs2=ps2.executeQuery();
					while(rs2.next()) {
						count++;
						String regno=rs2.getString(1);
						String fname=rs2.getString(2);
						String lname=rs2.getString(3);
						String name=fname+lname;
						String years=rs2.getString(4);
						String branch=rs2.getString(5);
						String purpose=rs2.getString(6);
						String phone=rs2.getString(7);
						String email=rs2.getString(8);
						String cgpa=rs2.getString(9);
						
					
						pw.println(
								"                <tr>\r\n"
										+ "                    <td>"+count+"</td>\r\n"
										+ "                    <td>"+regno+"</td>\r\n"
										+ "                    <td>"+name+"</td>\r\n"
										+ "                    <td>"+years+"</td>\r\n"
										+ "                    <td>"+branch+"</td>\r\n"
										+ "                    <td>"+purpose+"</td>\r\n"
										+ "                    <td>"+phone+"</td>\r\n"
										+ "                    <td>"+email+"</td>\r\n"
										+ "                    <td>"+cgpa+"</td>\r\n"    
										+ "                    <td class=\"leave-app-actions\">\r\n");
										
						                 pw.println(
										"                        \r\n"
										+ "                    </td>\r\n"
										+ "                </tr>\r\n");
					}
		  }catch(Exception e ) {e.printStackTrace();}
					//=================================================================================
				    try {
					PreparedStatement ps3=con.prepareStatement("SELECT * FROM ( SELECT REGISTRATION.REG_NO, USER_STUDENTS.F_NAME, USER_STUDENTS.L_NAME, REGISTRATION.YEAR, USER_STUDENTS.BRANCH, REGISTRATION.PURPOSE, USER_STUDENTS.PHONE, USER_STUDENTS.EMAIL, MARKS.CGPA FROM REGISTRATION INNER JOIN USER_STUDENTS ON REGISTRATION.REG_NO = USER_STUDENTS.REG_NO  INNER JOIN MARKS ON REGISTRATION.REG_NO = MARKS.REG_NO WHERE REGISTRATION.YEAR = '"+yr+"' AND USER_STUDENTS.BRANCH = 'CSE' ORDER BY MARKS.CGPA DESC ) WHERE ROWNUM <= "+cse+"");
					   
//					ps3.setString(1, "CSE");
//					ps3.setString(2,yr );
//					ps3.setString(3,cse);
					ResultSet rs3=ps3.executeQuery();
					while(rs3.next()) {
						count++;
						String regno=rs3.getString(1);
						String fname=rs3.getString(2);
						String lname=rs3.getString(3);
						String name=fname+lname;
						String years=rs3.getString(4);
						String branch=rs3.getString(5);
						String purpose=rs3.getString(6);
						String phone=rs3.getString(7);
						String email=rs3.getString(8);
						String cgpa=rs3.getString(9);
						
					
						pw.println(
								"                <tr>\r\n"
										+ "                    <td>"+count+"</td>\r\n"
										+ "                    <td>"+regno+"</td>\r\n"
										+ "                    <td>"+name+"</td>\r\n"
										+ "                    <td>"+years+"</td>\r\n"
										+ "                    <td>"+branch+"</td>\r\n"
										+ "                    <td>"+purpose+"</td>\r\n"
										+ "                    <td>"+phone+"</td>\r\n"
										+ "                    <td>"+email+"</td>\r\n"
										+ "                    <td>"+cgpa+"</td>\r\n"    
										+ "                    <td class=\"leave-app-actions\">\r\n");
										
						                 pw.println(
										"                        \r\n"
										+ "                    </td>\r\n"
										+ "                </tr>\r\n");
					}
				    }catch(Exception e ) {e.printStackTrace();}
					//=================================================================================
				    try {
					PreparedStatement ps4=con.prepareStatement("SELECT * FROM ( SELECT REGISTRATION.REG_NO, USER_STUDENTS.F_NAME, USER_STUDENTS.L_NAME, REGISTRATION.YEAR, USER_STUDENTS.BRANCH, REGISTRATION.PURPOSE, USER_STUDENTS.PHONE, USER_STUDENTS.EMAIL, MARKS.CGPA FROM REGISTRATION INNER JOIN USER_STUDENTS ON REGISTRATION.REG_NO = USER_STUDENTS.REG_NO  INNER JOIN MARKS ON REGISTRATION.REG_NO = MARKS.REG_NO WHERE REGISTRATION.YEAR = '"+yr+"' AND USER_STUDENTS.BRANCH = 'ELEC' ORDER BY MARKS.CGPA DESC ) WHERE ROWNUM <= "+elec+"");
					   
//					ps4.setString(1, "ELEC");
//					ps4.setString(2,yr );
//					ps4.setString(3,elec);
					ResultSet rs4=ps4.executeQuery();
					while(rs4.next()) {
						count++;
						String regno=rs4.getString(1);
						String fname=rs4.getString(2);
						String lname=rs4.getString(3);
						String name=fname+lname;
						String years=rs4.getString(4);
						String branch=rs4.getString(5);
						String purpose=rs4.getString(6);
						String phone=rs4.getString(7);
						String email=rs4.getString(8);
						String cgpa=rs4.getString(9);
						
					
						pw.println(
								"                <tr>\r\n"
										+ "                    <td>"+count+"</td>\r\n"
										+ "                    <td>"+regno+"</td>\r\n"
										+ "                    <td>"+name+"</td>\r\n"
										+ "                    <td>"+years+"</td>\r\n"
										+ "                    <td>"+branch+"</td>\r\n"
										+ "                    <td>"+purpose+"</td>\r\n"
										+ "                    <td>"+phone+"</td>\r\n"
										+ "                    <td>"+email+"</td>\r\n"
										+ "                    <td>"+cgpa+"</td>\r\n"    
										+ "                    <td class=\"leave-app-actions\">\r\n");
										
						                 pw.println(
										"                        \r\n"
										+ "                    </td>\r\n"
										+ "                </tr>\r\n");
					}
				    }catch(Exception e ) {e.printStackTrace();}
					//=================================================================================
				    try {
					PreparedStatement ps5=con.prepareStatement("SELECT * FROM ( SELECT REGISTRATION.REG_NO, USER_STUDENTS.F_NAME, USER_STUDENTS.L_NAME, REGISTRATION.YEAR, USER_STUDENTS.BRANCH, REGISTRATION.PURPOSE, USER_STUDENTS.PHONE, USER_STUDENTS.EMAIL, MARKS.CGPA FROM REGISTRATION INNER JOIN USER_STUDENTS ON REGISTRATION.REG_NO = USER_STUDENTS.REG_NO  INNER JOIN MARKS ON REGISTRATION.REG_NO = MARKS.REG_NO WHERE REGISTRATION.YEAR = '"+yr+"' AND USER_STUDENTS.BRANCH = 'EXTC' ORDER BY MARKS.CGPA DESC ) WHERE ROWNUM <= "+extc+"");
//					   
//					ps5.setString(1, "EXTC");
//					ps5.setString(2,yr );
//					ps5.setString(3,extc);
					ResultSet rs5=ps5.executeQuery();
					while(rs5.next()) {
						count++;
						String regno=rs5.getString(1);
						String fname=rs5.getString(2);
						String lname=rs5.getString(3);
						String name=fname+lname;
						String years=rs5.getString(4);
						String branch=rs5.getString(5);
						String purpose=rs5.getString(6);
						String phone=rs5.getString(7);
						String email=rs5.getString(8);
						String cgpa=rs5.getString(9);
						
					
						
						pw.println(
								"                <tr>\r\n"
										+ "                    <td>"+count+"</td>\r\n"
										+ "                    <td>"+regno+"</td>\r\n"
										+ "                    <td>"+name+"</td>\r\n"
										+ "                    <td>"+years+"</td>\r\n"
										+ "                    <td>"+branch+"</td>\r\n"
										+ "                    <td>"+purpose+"</td>\r\n"
										+ "                    <td>"+phone+"</td>\r\n"
										+ "                    <td>"+email+"</td>\r\n"
										+ "                    <td>"+cgpa+"</td>\r\n"    
										+ "                    <td class=\"leave-app-actions\">\r\n");
										
						                 pw.println(
										"                        \r\n"
										+ "                    </td>\r\n"
										+ "                </tr>\r\n");
					}
				    }catch(Exception e ) {e.printStackTrace();}
					//=================================================================================
				    try {
					PreparedStatement ps6=con.prepareStatement("SELECT * FROM ( SELECT REGISTRATION.REG_NO, USER_STUDENTS.F_NAME, USER_STUDENTS.L_NAME, REGISTRATION.YEAR, USER_STUDENTS.BRANCH, REGISTRATION.PURPOSE, USER_STUDENTS.PHONE, USER_STUDENTS.EMAIL, MARKS.CGPA FROM REGISTRATION INNER JOIN USER_STUDENTS ON REGISTRATION.REG_NO = USER_STUDENTS.REG_NO  INNER JOIN MARKS ON REGISTRATION.REG_NO = MARKS.REG_NO WHERE REGISTRATION.YEAR = '"+yr+"' AND USER_STUDENTS.BRANCH = 'IT' ORDER BY MARKS.CGPA DESC ) WHERE ROWNUM <= "+it+"");
					   
//					ps6.setString(1, "IT");
//					ps6.setString(2,yr );
//					ps6.setString(3,it);
					ResultSet rs6=ps6.executeQuery();
					while(rs6.next()) {
						count++;
						String regno=rs6.getString(1);
						String fname=rs6.getString(2);
						String lname=rs6.getString(3);
						String name=fname+lname;
						String years=rs6.getString(4);
						String branch=rs6.getString(5);
						String purpose=rs6.getString(6);
						String phone=rs6.getString(7);
						String email=rs6.getString(8);
						String cgpa=rs6.getString(9);
						
						pw.println(
								"                <tr>\r\n"
										+ "                    <td>"+count+"</td>\r\n"
										+ "                    <td>"+regno+"</td>\r\n"
										+ "                    <td>"+name+"</td>\r\n"
										+ "                    <td>"+years+"</td>\r\n"
										+ "                    <td>"+branch+"</td>\r\n"
										+ "                    <td>"+purpose+"</td>\r\n"
										+ "                    <td>"+phone+"</td>\r\n"
										+ "                    <td>"+email+"</td>\r\n"
										+ "                    <td>"+cgpa+"</td>\r\n"    
										+ "                    <td class=\"leave-app-actions\">\r\n");
										
						                 pw.println(
										"                        \r\n"
										+ "                    </td>\r\n"
										+ "                </tr>\r\n");
					}
				    }catch(Exception e ) {e.printStackTrace();}
					//=================================================================================
				    try {
					PreparedStatement ps7=con.prepareStatement("SELECT * FROM ( SELECT REGISTRATION.REG_NO, USER_STUDENTS.F_NAME, USER_STUDENTS.L_NAME, REGISTRATION.YEAR, USER_STUDENTS.BRANCH, REGISTRATION.PURPOSE, USER_STUDENTS.PHONE, USER_STUDENTS.EMAIL, MARKS.CGPA FROM REGISTRATION INNER JOIN USER_STUDENTS ON REGISTRATION.REG_NO = USER_STUDENTS.REG_NO  INNER JOIN MARKS ON REGISTRATION.REG_NO = MARKS.REG_NO WHERE REGISTRATION.YEAR = '"+yr+"' AND USER_STUDENTS.BRANCH ='MECH'  ORDER BY MARKS.CGPA DESC ) WHERE ROWNUM <= "+mech+"");
//					   
//					ps7.setString(1, "MECH");
//					ps7.setString(2,yr );
//					ps7.setString(3,mech);
					ResultSet rs7=ps7.executeQuery();
					while(rs7.next()) {
						count++;
						String regno=rs7.getString(1);
						String fname=rs7.getString(2);
						String lname=rs7.getString(3);
						String name=fname+lname;
						String years=rs7.getString(4);
						String branch=rs7.getString(5);
						String purpose=rs7.getString(6);
						String phone=rs7.getString(7);
						String email=rs7.getString(8);
						String cgpa=rs7.getString(9);
											
						pw.println(
								"                <tr>\r\n"
										+ "                    <td>"+count+"</td>\r\n"
										+ "                    <td>"+regno+"</td>\r\n"
										+ "                    <td>"+name+"</td>\r\n"
										+ "                    <td>"+years+"</td>\r\n"
										+ "                    <td>"+branch+"</td>\r\n"
										+ "                    <td>"+purpose+"</td>\r\n"
										+ "                    <td>"+phone+"</td>\r\n"
										+ "                    <td>"+email+"</td>\r\n"
										+ "                    <td>"+cgpa+"</td>\r\n"    
										+ "                    <td class=\"leave-app-actions\">\r\n");
										
						                 pw.println(
										"                        \r\n"
										+ "                    </td>\r\n"
										+ "                </tr>\r\n");
					}
				    }catch(Exception e ) {e.printStackTrace();}
					//=================================================================================
				    try {
					PreparedStatement ps8=con.prepareStatement("SELECT * FROM ( SELECT REGISTRATION.REG_NO, USER_STUDENTS.F_NAME, USER_STUDENTS.L_NAME, REGISTRATION.YEAR, USER_STUDENTS.BRANCH, REGISTRATION.PURPOSE, USER_STUDENTS.PHONE, USER_STUDENTS.EMAIL, MARKS.CGPA FROM REGISTRATION INNER JOIN USER_STUDENTS ON REGISTRATION.REG_NO = USER_STUDENTS.REG_NO  INNER JOIN MARKS ON REGISTRATION.REG_NO = MARKS.REG_NO WHERE REGISTRATION.YEAR = '"+yr+"' AND USER_STUDENTS.BRANCH ='PROD' ORDER BY MARKS.CGPA DESC ) WHERE ROWNUM <="+prod+"");
//					   
//					ps8.setString(1, "PROD");
//					ps8.setString(2,yr );
//					ps8.setString(3,prod);
					ResultSet rs8=ps8.executeQuery();
					while(rs8.next()) {
						count++;
						String regno=rs8.getString(1);
						String fname=rs8.getString(2);
						String lname=rs8.getString(3);
						String name=fname+lname;
						String years=rs8.getString(4);
						String branch=rs8.getString(5);
						String purpose=rs8.getString(6);
						String phone=rs8.getString(7);
						String email=rs8.getString(8);
						String cgpa=rs8.getString(9);
						
					
						
						pw.println(
								"                <tr>\r\n"
										+ "                    <td>"+count+"</td>\r\n"
										+ "                    <td>"+regno+"</td>\r\n"
										+ "                    <td>"+name+"</td>\r\n"
										+ "                    <td>"+years+"</td>\r\n"
										+ "                    <td>"+branch+"</td>\r\n"
										+ "                    <td>"+purpose+"</td>\r\n"
										+ "                    <td>"+phone+"</td>\r\n"
										+ "                    <td>"+email+"</td>\r\n"
										+ "                    <td>"+cgpa+"</td>\r\n"    
										+ "                    <td class=\"leave-app-actions\">\r\n");
										
						                 pw.println(
										"                        \r\n"
										+ "                    </td>\r\n"
										+ "                </tr>\r\n");
					}
				    }catch(Exception e ) {e.printStackTrace();}
					//=================================================================================
				    try {
					PreparedStatement ps9=con.prepareStatement("SELECT * FROM ( SELECT REGISTRATION.REG_NO, USER_STUDENTS.F_NAME, USER_STUDENTS.L_NAME, REGISTRATION.YEAR, USER_STUDENTS.BRANCH, REGISTRATION.PURPOSE, USER_STUDENTS.PHONE, USER_STUDENTS.EMAIL, MARKS.CGPA FROM REGISTRATION INNER JOIN USER_STUDENTS ON REGISTRATION.REG_NO = USER_STUDENTS.REG_NO  INNER JOIN MARKS ON REGISTRATION.REG_NO = MARKS.REG_NO WHERE REGISTRATION.YEAR = '"+yr+"' AND USER_STUDENTS.BRANCH = 'TEXT' ORDER BY MARKS.CGPA DESC ) WHERE ROWNUM <= "+text+"");
//					   
//					ps9.setString(1, "TEXT");
//					ps9.setString(2,yr );
//					ps9.setString(3,text);
					ResultSet rs9=ps9.executeQuery();
					while(rs9.next()) {
						count++;
						String regno=rs9.getString(1);
						String fname=rs9.getString(2);
						String lname=rs9.getString(3);
						String name=fname+lname;
						String years=rs9.getString(4);
						String branch=rs9.getString(5);
						String purpose=rs9.getString(6);
						String phone=rs9.getString(7);
						String email=rs9.getString(8);
						String cgpa=rs9.getString(9);
						
			
						
						pw.println(
								"                <tr>\r\n"
										+ "                    <td>"+count+"</td>\r\n"
										+ "                    <td>"+regno+"</td>\r\n"
										+ "                    <td>"+name+"</td>\r\n"
										+ "                    <td>"+years+"</td>\r\n"
										+ "                    <td>"+branch+"</td>\r\n"
										+ "                    <td>"+purpose+"</td>\r\n"
										+ "                    <td>"+phone+"</td>\r\n"
										+ "                    <td>"+email+"</td>\r\n"
										+ "                    <td>"+cgpa+"</td>\r\n"    
										+ "                    <td class=\"leave-app-actions\">\r\n");
										
						                 pw.println(
										"                        \r\n"
										+ "                    </td>\r\n"
										+ "                </tr>\r\n");
					}
				    }catch(Exception e ) {e.printStackTrace();}
					//=================================================================================
				    try {
					PreparedStatement ps10=con.prepareStatement("SELECT * FROM ( SELECT REGISTRATION.REG_NO, USER_STUDENTS.F_NAME, USER_STUDENTS.L_NAME, REGISTRATION.YEAR, USER_STUDENTS.BRANCH, REGISTRATION.PURPOSE, USER_STUDENTS.PHONE, USER_STUDENTS.EMAIL, MARKS.CGPA FROM REGISTRATION INNER JOIN USER_STUDENTS ON REGISTRATION.REG_NO = USER_STUDENTS.REG_NO  INNER JOIN MARKS ON REGISTRATION.REG_NO = MARKS.REG_NO WHERE REGISTRATION.YEAR = '"+yr+"' AND USER_STUDENTS.BRANCH = 'INST' ORDER BY MARKS.CGPA DESC ) WHERE ROWNUM <= "+instru+"");
			
//					ps10.setString(1, "INSTRU");
//					ps10.setString(2,yr );
//					ps10.setString(3,instru);
					ResultSet rs10=ps10.executeQuery();
					while(rs10.next()) {
						count++;
						String regno=rs10.getString(1);
						String fname=rs10.getString(2);
						String lname=rs10.getString(3);
						String name=fname+lname;
						String years=rs10.getString(4);
						String branch=rs10.getString(5);
						String purpose=rs10.getString(6);
						String phone=rs10.getString(7);
						String email=rs10.getString(8);
						String cgpa=rs10.getString(9);
						
						
						pw.println(
								"                <tr>\r\n"
										+ "                    <td>"+count+"</td>\r\n"
										+ "                    <td>"+regno+"</td>\r\n"
										+ "                    <td>"+name+"</td>\r\n"
										+ "                    <td>"+years+"</td>\r\n"
										+ "                    <td>"+branch+"</td>\r\n"
										+ "                    <td>"+purpose+"</td>\r\n"
										+ "                    <td>"+phone+"</td>\r\n"
										+ "                    <td>"+email+"</td>\r\n"
										+ "                    <td>"+cgpa+"</td>\r\n"    
										+ "                    <td class=\"leave-app-actions\">\r\n");
										
						                 pw.println(
										"                        \r\n"
										+ "                    </td>\r\n"
										+ "                </tr>\r\n");
					}
				    }catch(Exception e ) {e.printStackTrace();}
					//=================================================================================
			
		
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
			
			
			
			
			System.out.println("end of story");
			
		}catch(Exception e) {
			e.printStackTrace();
		}
		
	}
		
	
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		doGet(req,res);
	}
}
